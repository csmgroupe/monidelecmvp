"""FastAPI application for NF C 15-100 electrical installation compliance validation."""

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from typing import Dict, Any, Optional, List
import json
import logging
from datetime import datetime
from fastapi import BackgroundTasks

from .models import (
    ValidationRequest, 
    ValidationResponse, 
    ValidationResult,
    RoomEquipmentValidationRequest,
    RoomEquipmentValidationResponse,
    GlobalValidationWithDimensioningResponse,
    GlobalComplianceResult,
    ComplianceStatus
)
from .validators import NFC15100Validator
from .config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="NF C 15-100 Compliance Engine",
    description="Electrical installation validation microservice using SHACL",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Import middleware
from .middleware import logging_middleware, security_headers_middleware

# Add security middleware first
app.middleware("http")(security_headers_middleware)

# Add logging middleware
app.middleware("http")(logging_middleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize validators
validator = NFC15100Validator()


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint returning basic API information."""
    return {
        "name": "NF C 15-100 Compliance Engine",
        "version": "0.1.0",
        "description": "Electrical installation validation microservice",
        "docs": "/docs",
        "new_endpoints": [
            "/validate/room-equipment",
            "/validate/global-with-dimensioning"
        ]
    }


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "nfc-15-100-compliance-engine"
    }


@app.post("/validate", response_model=ValidationResponse)
async def validate_installation(request: ValidationRequest) -> ValidationResponse:
    """
    Validate an electrical installation against NF C 15-100 standards.
    
    Args:
        request: ValidationRequest containing JSON-LD data
        
    Returns:
        ValidationResponse with validation results
    """
    try:
        logger.info(f"Starting validation for installation: {request.installation_id}")
        
        # Perform SHACL validation
        validation_result = await validator.validate(request.jsonld_data)
        
        # Create response
        response = ValidationResponse(
            installation_id=request.installation_id,
            is_valid=validation_result.is_valid,
            validation_results=[validation_result],
            timestamp=datetime.utcnow(),
            total_violations=len(validation_result.violations) if validation_result.violations else 0
        )
        
        logger.info(f"Validation completed for {request.installation_id}: {'PASS' if response.is_valid else 'FAIL'}")
        return response
        
    except ValidationError as e:
        logger.error(f"Validation error for {request.installation_id}: {e}")
        raise HTTPException(status_code=422, detail=f"Erreur de validation : {e}")
    except Exception as e:
        logger.error(f"Unexpected error during validation: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur lors de la validation")


@app.post("/validate/file", response_model=ValidationResponse)
async def validate_installation_file(
    file: UploadFile = File(...),
    installation_id: Optional[str] = None
) -> ValidationResponse:
    """
    Validate an electrical installation from uploaded JSON-LD file.
    
    Args:
        file: Uploaded JSON-LD file
        installation_id: Optional installation identifier
        
    Returns:
        ValidationResponse with validation results
    """
    try:
        # Read file content
        content = await file.read()
        
        # Parse JSON-LD
        try:
            jsonld_data = json.loads(content.decode('utf-8'))
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Format JSON invalide : {e}")
        
        # Create validation request
        request = ValidationRequest(
            installation_id=installation_id or f"file-{datetime.utcnow().timestamp()}",
            jsonld_data=jsonld_data
        )
        
        # Validate
        return await validate_installation(request)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing file upload: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors du traitement du fichier téléchargé")


@app.get("/rules")
async def get_validation_rules() -> Dict[str, Any]:
    """
    Get information about available NF C 15-100 validation rules.
    
    Returns:
        Dictionary containing rule categories and descriptions
    """
    return validator.get_rules_info()


@app.get("/ontology")
async def get_ontology() -> Dict[str, Any]:
    """
    Get the NF C 15-100 ontology structure.
    
    Returns:
        Dictionary containing ontology classes and properties
    """
    return validator.get_ontology_info()


@app.post("/validate/batch", response_model=List[ValidationResponse])
async def validate_batch(requests: List[ValidationRequest]) -> List[ValidationResponse]:
    """
    Validate multiple electrical installations in batch.
    
    Args:
        requests: List of ValidationRequest objects
        
    Returns:
        List of ValidationResponse objects
    """
    try:
        results = []
        for request in requests:
            try:
                result = await validate_installation(request)
                results.append(result)
            except Exception as e:
                # Create error response for failed validations
                error_response = ValidationResponse(
                    installation_id=request.installation_id,
                    is_valid=False,
                    validation_results=[],
                    timestamp=datetime.utcnow(),
                    total_violations=0,
                    error=str(e)
                )
                results.append(error_response)
        
        return results
        
    except Exception as e:
        logger.error(f"Error in batch validation: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la validation par lot")

@app.post("/validate/room-equipment", response_model=RoomEquipmentValidationResponse)
async def validate_room_equipment(request: RoomEquipmentValidationRequest) -> RoomEquipmentValidationResponse:
    """
    Step 2: Validate equipment selection by rooms and globally according to NF C 15-100.
    
    This endpoint implements the room-by-room compliance checking functionality:
    - Validates equipment requirements for each room type
    - Checks cross-room rules (e.g., network sockets in bedrooms)
    - Returns compliance status for each room and globally
    
    Args:
        request: RoomEquipmentValidationRequest containing room equipment selections
        
    Returns:
        RoomEquipmentValidationResponse with room-by-room and global compliance results
    """
    try:
        logger.info(f"Starting room equipment validation for installation: {request.installation_id}")
        
        # Perform room-by-room validation
        global_compliance, room_results = await validator.validate_room_equipment(request.rooms)
        
        # Create response
        response = RoomEquipmentValidationResponse(
            installation_id=request.installation_id,
            global_compliance=global_compliance,
            room_results=room_results,
            timestamp=datetime.utcnow()
        )
        
        # Log summary
        compliant_rooms = sum(1 for r in room_results if r.compliance_status.value == "compliant")
        total_rooms = len(room_results)
        logger.info(f"Room equipment validation completed for {request.installation_id}: "
                   f"{compliant_rooms}/{total_rooms} rooms compliant, "
                   f"global status: {global_compliance.overall_status.value}")
        
        return response
        
    except ValidationError as e:
        logger.error(f"Validation error for {request.installation_id}: {e}")
        raise HTTPException(status_code=422, detail=f"Erreur de validation : {e}")
    except Exception as e:
        logger.error(f"Unexpected error during room equipment validation: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur lors de la validation de l'équipement des pièces")


@app.post("/validate/global-with-dimensioning", response_model=GlobalValidationWithDimensioningResponse)
async def validate_global_with_dimensioning(request: RoomEquipmentValidationRequest) -> GlobalValidationWithDimensioningResponse:
    """
    Step 3: Global validation with electrical dimensioning calculations.
    
    This endpoint provides comprehensive validation and dimensioning:
    - Performs room-by-room validation (basic equipment rules only)
    - Calculates required circuit breakers, surge protectors, electrical panels
    - Re-validates with calculated dimensioning to ensure compliance
    - Provides complete electrical installation specification
    
    Args:
        request: RoomEquipmentValidationRequest containing room equipment selections
        
    Returns:
        GlobalValidationWithDimensioningResponse with compliance results and dimensioning
    """
    try:
        logger.info(f"Starting global validation with dimensioning for installation: {request.installation_id}")
        
        # Step 1: Perform basic room-by-room validation (exclude dimensioning rules)
        basic_compliance, room_results = await validator.validate_room_equipment(request.rooms, include_dimensioning_rules=False)
        
        # Step 2: Calculate electrical dimensioning based on equipment
        dimensioning = validator.calculate_dimensioning(
            request.rooms,
            basic_compliance,
            postal_code=request.postal_code,
            number_of_people=request.number_of_people,
        )
        
        # Step 3: Create enhanced JSON-LD with calculated dimensioning for final validation
        enhanced_jsonld = validator.create_complete_installation_jsonld(
            request.rooms,
            dimensioning,
            postal_code=request.postal_code,
        )
        
        # Step 4: Final validation with complete installation (including dimensioning)
        final_validation = await validator.validate(enhanced_jsonld, focus_area=None)
        
        # Step 5: Create final compliance result
        final_compliance = GlobalComplianceResult(
            overall_status=ComplianceStatus.COMPLIANT if final_validation.is_valid else ComplianceStatus.NON_COMPLIANT,
            violations=final_validation.violations or [],
            warnings=[],
            missing_equipment_summary=[]
        )
        
        # Create response
        response = GlobalValidationWithDimensioningResponse(
            installation_id=request.installation_id,
            global_compliance=final_compliance,
            room_results=room_results,
            dimensioning=dimensioning,
            timestamp=datetime.utcnow()
        )
        
        # Log summary
        total_breakers = sum(spec.quantity for spec in dimensioning.circuit_breakers)
        total_cables = len(dimensioning.cables)
        logger.info(f"Global validation with dimensioning completed for {request.installation_id}: "
                   f"global status: {final_compliance.overall_status.value}, "
                   f"{total_breakers} circuit breakers, {total_cables} cable types")
        
        return response
        
    except ValidationError as e:
        logger.error(f"Validation error for {request.installation_id}: {e}")
        raise HTTPException(status_code=422, detail=f"Erreur de validation : {e}")
    except Exception as e:
        logger.error(f"Unexpected error during global validation with dimensioning: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur lors de la validation globale avec dimensionnement")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "compliance_engine.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    ) 