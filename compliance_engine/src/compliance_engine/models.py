"""Pydantic models for the NF C 15-100 compliance engine."""

from pydantic import BaseModel, Field, validator
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
from enum import Enum


class SeverityLevel(str, Enum):
    """Severity levels for validation violations."""
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class ViolationType(str, Enum):
    """Types of NF C 15-100 violations."""
    SAFETY = "safety"
    INSTALLATION = "installation"
    CIRCUIT = "circuit"
    PROTECTION = "protection"
    EQUIPMENT = "equipment"
    ROOM_SPECIFIC = "room_specific"


class ValidationViolation(BaseModel):
    """Represents a single validation violation."""
    
    violation_id: str = Field(..., description="Unique identifier for the violation")
    rule_id: str = Field(..., description="NF C 15-100 rule identifier")
    severity: SeverityLevel = Field(..., description="Severity level of the violation")
    violation_type: ViolationType = Field(..., description="Type of violation")
    message: str = Field(..., description="Human-readable description of the violation")
    path: Optional[str] = Field(None, description="JSON-LD path to the violating element")
    focus_node: Optional[str] = Field(None, description="RDF node that caused the violation")
    value: Optional[Union[str, int, float, bool]] = Field(None, description="The violating value")
    suggested_fix: Optional[str] = Field(None, description="Suggested fix for the violation")
    
    class Config:
        extra = "allow"


class ComplianceStatus(str, Enum):
    """Compliance status indicators for validation results."""
    COMPLIANT = "compliant"      # Green checkmark
    NON_COMPLIANT = "non_compliant"  # Red alert
    WARNING = "warning"          # Yellow warning
    MISSING = "missing"          # Yellow warning for missing equipment


class RoomType(str, Enum):
    """Room types according to NF C 15-100."""
    KITCHEN = "Kitchen"  # Cuisine
    LIVING_ROOM = "LivingRoom"  # Salon/Séjour
    LIVING_ROOM_WITH_INTEGRATED_KITCHEN = "LivingRoomWithIntegratedKitchen"  # Salon/Séjour avec cuisine intégré
    LIVING_ROOM_WITH_KITCHEN = "LivingRoomWithKitchen"  # Alternative naming from frontend
    CIRCULATION_AREA = "CirculationArea"  # Circulation et locaux ≥ 4 m²
    WET_ROOM = "WetRoom"  # Salle d'eau
    WC = "WC"  # WC
    BATHROOM_WITH_WC = "BathroomWithWC"  # Salle d'eau avec WC
    BEDROOM = "Bedroom"  # Chambre
    OFFICE = "Office"  # Bureau
    OTHER = "Other"  # Autres (garage, dégagement < 4 m2, placard…)
    EXTERIOR_SPACE = "ExteriorSpace"  # Extérieur (terrasse, patio…)


class EquipmentType(str, Enum):
    """Equipment types for rooms - includes base classes and subclasses from NF C 15-100 ontology."""
    # Base classes
    SOCKET = "Socket"
    NETWORK_SOCKET = "NetworkSocket"
    LIGHTING_POINT = "LightingPoint"
    SWITCH = "Switch"
    SPECIALIZED_EQUIPMENT = "SpecializedEquipment"
    
    # Socket subclasses
    SIMPLE_SOCKET = "SimpleSocket"
    DOUBLE_SOCKET = "DoubleSocket"
    TRIPLE_SOCKET = "TripleSocket"
    WATERPROOF_SOCKET = "WaterproofSocket"
    CHILDPROOF_SOCKET = "ChildproofSocket"
    USB_SOCKET = "USBSocket"
    HIGH_CURRENT_SOCKET = "HighCurrentSocket"
    
    # Switch subclasses
    SIMPLE_SWITCH = "SimpleSwitch"
    DOUBLE_SWITCH = "DoubleSwitch"
    TRIPLE_SWITCH = "TripleSwitch"
    DIM_SWITCH = "DimmerSwitch"
    MOTION_SENSOR_SWITCH = "MotionSensorSwitch"
    REMOTE_SWITCH = "RemoteSwitch"
    TIMER_SWITCH = "TimerSwitch"
    
    # Lighting subclasses
    CEILING_LIGHTING = "CeilingLighting"
    WALL_LIGHTING = "WallLighting"
    SPOT_LIGHTING = "SpotLighting"
    EMERGENCY_LIGHTING = "EmergencyLighting"
    EXTERIOR_LIGHTING = "ExteriorLighting"
    
    # Network subclasses
    RJ45_SOCKET = "RJ45Socket"
    FIBER_SOCKET = "FiberSocket"
    COAX_SOCKET = "CoaxSocket"
    
    # Specialized equipment subclasses
    ELECTRIC_HEATING = "ElectricHeating"
    WATER_HEATER = "WaterHeater"
    VENTILATION = "Ventilation"
    ALARM_SYSTEM = "AlarmSystem"
    INTERCOM = "Intercom"
    # Additional specialized equipment subclasses from ontology
    ELECTRIC_OVEN = "ElectricOven"
    DISHWASHER = "Dishwasher"
    WASHING_MACHINE = "WashingMachine"
    DRYER = "Dryer"
    COOKING_HOB = "CookingHob"
    AIR_CONDITIONING = "AirConditioning"
    CONVECTOR = "Convector"
    INERTIA_RADIATOR = "InertiaRadiator"
    FLOOR_HEATING = "FloorHeating"
    DUCTED_HEAT_PUMP = "DuctedHeatPump"
    ELECTRIC_WATER_HEATER = "ElectricWaterHeater"
    INSTANTANEOUS_WATER_HEATER = "InstantaneousWaterHeater"
    STORAGE_WATER_HEATER = "StorageWaterHeater"
    VMC = "VMC"
    SIMPLE_FLOW_VMC = "SimpleFlowVMC"
    DOUBLE_FLOW_VMC = "DoubleFlowVMC"
    # Additional socket subclasses
    TV_SOCKET = "TVSocket"
    OVEN_SOCKET = "OvenSocket"
    DEDICATED_20A_SOCKET = "Dedicated20ASocket"
    EXTRACTOR_SOCKET = "ExtractorSocket"


class EquipmentItem(BaseModel):
    """Individual equipment item in a room."""
    
    equipment_type: EquipmentType = Field(..., description="Type of equipment")
    quantity: int = Field(..., description="Number of this equipment type", ge=0)
    specifications: Optional[Dict[str, Any]] = Field(default={}, description="Additional specifications")
    
    class Config:
        extra = "allow"


class RoomEquipment(BaseModel):
    """Equipment selection for a single room."""
    
    room_id: str = Field(..., description="Unique room identifier")
    room_type: RoomType = Field(..., description="Type of room")
    room_area: Optional[float] = Field(None, description="Room area in square meters", ge=0)
    equipment: List[EquipmentItem] = Field(..., description="List of equipment in this room")
    
    class Config:
        extra = "allow"


class RoomComplianceResult(BaseModel):
    """Compliance result for a single room."""
    
    room_id: str = Field(..., description="Room identifier")
    room_type: RoomType = Field(..., description="Type of room") 
    compliance_status: ComplianceStatus = Field(..., description="Overall compliance status for this room")
    violations: List[ValidationViolation] = Field(default=[], description="Violations found in this room")
    warnings: List[str] = Field(default=[], description="Warning messages for this room")
    missing_equipment: List[str] = Field(default=[], description="Equipment missing according to NF C 15-100")
    
    class Config:
        extra = "allow"


class GlobalComplianceResult(BaseModel):
    """Global compliance result across all rooms."""
    
    overall_status: ComplianceStatus = Field(..., description="Overall compliance status")
    violations: List[ValidationViolation] = Field(default=[], description="Global violations")
    warnings: List[str] = Field(default=[], description="Global warning messages")
    missing_equipment_summary: List[str] = Field(default=[], description="Summary of missing equipment across rooms")
    
    class Config:
        extra = "allow"


class RoomEquipmentValidationRequest(BaseModel):
    """Request model for room-by-room equipment validation."""
    
    installation_id: str = Field(..., description="Unique identifier for the installation")
    rooms: List[RoomEquipment] = Field(..., description="Equipment selection for each room")
    validation_options: Optional[Dict[str, Any]] = Field(default={}, description="Additional validation options")
    postal_code: Optional[str] = Field(None, description="French postal code (first 2–3 digits used for department-based rules)")
    number_of_people: Optional[int] = Field(
        None,
        description="Number of people living in the dwelling (used for water-heater sizing)",
        ge=1,
    )
    
    class Config:
        extra = "allow"
        schema_extra = {
            "example": {
                "installation_id": "HOUSE-001",
                "rooms": [
                    {
                        "room_id": "bedroom1",
                        "room_type": "Bedroom",
                        "room_area": 15.0,
                        "equipment": [
                            {
                                "equipment_type": "Socket",
                                "quantity": 3,
                                "specifications": {"type": "2P+T", "current": 16}
                            },
                            {
                                "equipment_type": "NetworkSocket", 
                                "quantity": 1,
                                "specifications": {"type": "RJ45"}
                            }
                        ]
                    },
                    {
                        "room_id": "bedroom2",
                        "room_type": "Bedroom", 
                        "room_area": 12.0,
                        "equipment": [
                            {
                                "equipment_type": "Socket",
                                "quantity": 3,
                                "specifications": {"type": "2P+T", "current": 16}
                            }
                        ]
                    }
                ]
            }
        }


class RoomEquipmentValidationResponse(BaseModel):
    """Response model for room-by-room equipment validation."""
    
    installation_id: str = Field(..., description="Installation identifier")
    global_compliance: GlobalComplianceResult = Field(..., description="Global compliance result")
    room_results: List[RoomComplianceResult] = Field(..., description="Individual room compliance results")
    timestamp: datetime = Field(..., description="When the validation was performed")
    
    class Config:
        extra = "allow"


class CircuitBreakerSpec(BaseModel):
    """Circuit breaker specification."""
    
    rating: int = Field(..., description="Current rating in amperes")
    type: str = Field(..., description="Breaker type (e.g., 'Type C')")
    quantity: int = Field(..., description="Number of breakers needed", ge=0)
    description: str = Field(..., description="Description of what this breaker protects")


class SurgeProtectorSpec(BaseModel):
    """Surge protector specification."""
    
    type: str = Field(..., description="Type of surge protector")
    rating: Optional[str] = Field(None, description="Protection rating")
    quantity: int = Field(..., description="Number needed", ge=0)
    description: str = Field(..., description="Description of protection")


class ElectricalPanelSpec(BaseModel):
    """Electrical panel specification."""
    
    type: str = Field(..., description="Panel type")
    modules: int = Field(..., description="Number of modules/slots")
    quantity: int = Field(..., description="Number of panels needed", ge=1)
    description: str = Field(..., description="Panel description")


class CableSpec(BaseModel):
    """Cable specification."""
    
    section: float = Field(..., description="Wire cross-section in mm²")
    type: str = Field(..., description="Cable type (e.g., 'H07V-U')")
    length_estimate: float = Field(..., description="Estimated length in meters")
    description: str = Field(..., description="Cable purpose description")


class DimensioningResult(BaseModel):
    """Electrical dimensioning calculation results."""
    
    circuit_breakers: List[CircuitBreakerSpec] = Field(..., description="Required circuit breakers")
    surge_protectors: List[SurgeProtectorSpec] = Field(..., description="Required surge protectors")
    electrical_panels: List[ElectricalPanelSpec] = Field(..., description="Required electrical panels")
    cables: List[CableSpec] = Field(..., description="Required cables")
    total_estimated_cost: Optional[float] = Field(None, description="Total estimated cost")
    installation_notes: List[str] = Field(default=[], description="Installation notes and recommendations")


class GlobalValidationWithDimensioningResponse(BaseModel):
    """Response model for global validation with dimensioning calculations."""
    
    installation_id: str = Field(..., description="Installation identifier")
    global_compliance: GlobalComplianceResult = Field(..., description="Global compliance result")
    room_results: List[RoomComplianceResult] = Field(..., description="Individual room compliance results")
    dimensioning: DimensioningResult = Field(..., description="Electrical dimensioning calculations")
    timestamp: datetime = Field(..., description="When the validation was performed")
    
    class Config:
        extra = "allow"


class ValidationResult(BaseModel):
    """Results of a single validation run."""
    
    is_valid: bool = Field(..., description="Whether the installation is valid")
    violations: Optional[List[ValidationViolation]] = Field(default=[], description="List of violations found")
    rules_checked: List[str] = Field(default=[], description="List of rules that were checked")
    validation_time_ms: Optional[float] = Field(None, description="Time taken for validation in milliseconds")
    
    class Config:
        extra = "allow"


class ValidationRequest(BaseModel):
    """Request model for electrical installation validation."""
    
    installation_id: str = Field(..., description="Unique identifier for the installation")
    jsonld_data: Dict[str, Any] = Field(..., description="JSON-LD data representing the electrical installation")
    validation_options: Optional[Dict[str, Any]] = Field(default={}, description="Additional validation options")
    
    @validator('jsonld_data')
    def validate_jsonld_structure(cls, v):
        """Validate that the JSON-LD data has required structure."""
        if not isinstance(v, dict):
            raise ValueError("JSON-LD data must be a dictionary")
        
        # Check for required @context
        if '@context' not in v:
            raise ValueError("JSON-LD data must include @context")
        
        return v
    
    class Config:
        extra = "allow"
        schema_extra = {
            "example": {
                "installation_id": "INST-001",
                "jsonld_data": {
                    "@context": {
                        "nfc": "http://example.org/nfc15100#",
                        "xsd": "http://www.w3.org/2001/XMLSchema#"
                    },
                    "@type": "nfc:ElectricalInstallation",
                    "nfc:hasRoom": [
                        {
                            "@type": "nfc:Kitchen",
                            "nfc:hasSocket": [
                                {
                                    "@type": "nfc:Socket",
                                    "nfc:socketType": "2P+T",
                                    "nfc:current": 16,
                                    "nfc:height": 0.3
                                }
                            ]
                        }
                    ]
                }
            }
        }


class ValidationResponse(BaseModel):
    """Response model for validation results."""
    
    installation_id: str = Field(..., description="Installation identifier")
    is_valid: bool = Field(..., description="Overall validation result")
    validation_results: List[ValidationResult] = Field(..., description="Detailed validation results")
    timestamp: datetime = Field(..., description="When the validation was performed")
    total_violations: int = Field(..., description="Total number of violations found")
    error: Optional[str] = Field(None, description="Error message if validation failed")
    
    class Config:
        extra = "allow"


class RuleInfo(BaseModel):
    """Information about a specific NF C 15-100 rule."""
    
    rule_id: str = Field(..., description="Rule identifier")
    title: str = Field(..., description="Rule title")
    description: str = Field(..., description="Rule description")
    category: str = Field(..., description="Rule category")
    severity: SeverityLevel = Field(..., description="Default severity level")
    article_reference: Optional[str] = Field(None, description="Reference to NF C 15-100 article")
    
    class Config:
        extra = "allow"


class OntologyClass(BaseModel):
    """Information about an ontology class."""
    
    class_uri: str = Field(..., description="URI of the class")
    label: str = Field(..., description="Human-readable label")
    description: Optional[str] = Field(None, description="Class description")
    parent_classes: List[str] = Field(default=[], description="Parent class URIs")
    properties: List[str] = Field(default=[], description="Property URIs associated with this class")
    
    class Config:
        extra = "allow"


class OntologyProperty(BaseModel):
    """Information about an ontology property."""
    
    property_uri: str = Field(..., description="URI of the property")
    label: str = Field(..., description="Human-readable label")
    description: Optional[str] = Field(None, description="Property description")
    domain: Optional[str] = Field(None, description="Domain class URI")
    range: Optional[str] = Field(None, description="Range class URI")
    
    class Config:
        extra = "allow" 