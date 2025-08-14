"""SHACL validators for NF C 15-100 electrical installation compliance."""

import os
import time
import uuid
from typing import Dict, Any, List, Optional
from pathlib import Path
import logging
import math

from rdflib import Graph, Namespace, Literal, URIRef, BNode
from rdflib.namespace import RDF, RDFS, XSD
from pyshacl import validate
import json

from .models import (
    ValidationResult, 
    ValidationViolation, 
    SeverityLevel, 
    ViolationType,
    RuleInfo,
    OntologyClass,
    OntologyProperty,
    RoomEquipment,
    RoomComplianceResult,
    GlobalComplianceResult,
    ComplianceStatus,
    RoomType,
    EquipmentType,
    DimensioningResult,
    CircuitBreakerSpec,
    SurgeProtectorSpec,
    ElectricalPanelSpec,
    CableSpec
)
from .config import get_settings

logger = logging.getLogger(__name__)

# Define NF C 15-100 namespace - MUST match the ontology files
NFC = Namespace("http://ontology.nfc15100.fr#")


class NFC15100Validator:
    """Main validator for NF C 15-100 electrical installations."""
    
    HEATING_AREA_RATING_MAP: dict[EquipmentType, list[tuple[float, int]]] = {
        EquipmentType.CONVECTOR: [(63, 16), (65, 20), (75, 25), (90, 32)],
        EquipmentType.INERTIA_RADIATOR: [(30, 16), (40, 20), (50, 25), (60, 32)],
        EquipmentType.FLOOR_HEATING: [(20, 10), (40, 16), (50, 20), (60, 25), (80, 32)],
        EquipmentType.DUCTED_HEAT_PUMP: [(40, 20), (55, 25), (70, 32), (90, 40)],
        EquipmentType.AIR_CONDITIONING: [(44, 16), (56, 32), (63, 40)],
    }
    
    def __init__(self):
        """Initialize the validator with SHACL shapes and ontology."""
        self.settings = get_settings()
        self.ontology_graph = Graph()
        self.shapes_graph = Graph()
        self.rules_info = {}
        
        # Initialize graphs
        self._load_ontology()
        self._load_shapes()
        
    def _load_ontology(self) -> None:
        """Load the NF C 15-100 ontology."""
        try:
            # Try multiple possible paths for the ontology file
            possible_paths = [
                Path(self.settings.ontology_path),
            ]
            
            ontology_loaded = False
            for ontology_path in possible_paths:
                if ontology_path.exists():
                    self.ontology_graph.parse(str(ontology_path), format="turtle")
                    logger.info(f"✅ Loaded ontology from {ontology_path} ({len(self.ontology_graph)} triples)")
                    ontology_loaded = True
                    break
            
            if not ontology_loaded:
                logger.error(f"❌ Ontology file not found in any of these paths: {[str(p) for p in possible_paths]}")
                self._create_basic_ontology()
                
        except Exception as e:
            logger.error(f"❌ Error loading ontology: {e}")
            self._create_basic_ontology()
    
    def _create_basic_ontology(self) -> None:
        """Create a basic NF C 15-100 ontology structure."""
        # Define basic classes
        classes = [
            ("ElectricalInstallation", "An electrical installation according to NF C 15-100"),
            ("Room", "A room in a building"),
            ("Kitchen", "Kitchen room"),
            ("LivingRoom", "Living room"),
            ("Bedroom", "Bedroom"),
            ("Bathroom", "Bathroom"),
            ("Circuit", "Electrical circuit"),
            ("Socket", "Electrical socket outlet"),
            ("Switch", "Electrical switch"),
            ("Light", "Lighting point"),
            ("Protection", "Electrical protection device"),
            ("CircuitBreaker", "Circuit breaker"),
            ("RCD", "Residual current device"),
            ("Equipment", "Electrical equipment"),
        ]
        
        # Add classes to ontology
        for class_name, description in classes:
            class_uri = NFC[class_name]
            self.ontology_graph.add((class_uri, RDF.type, RDFS.Class))
            self.ontology_graph.add((class_uri, RDFS.label, Literal(class_name)))
            self.ontology_graph.add((class_uri, RDFS.comment, Literal(description)))
        
        # Define properties
        properties = [
            ("hasRoom", "Links installation to rooms"),
            ("hasSocket", "Links room to sockets"),
            ("hasCircuit", "Links installation to circuits"),
            ("hasProtection", "Links circuit to protection"),
            ("socketType", "Type of socket (e.g., 2P+T)"),
            ("current", "Current rating in amperes"),
            ("voltage", "Voltage rating in volts"),
            ("height", "Height from floor in meters"),
            ("wireSection", "Wire cross-section in mm²"),
            ("roomArea", "Room area in square meters"),
        ]
        
        # Add properties to ontology
        for prop_name, description in properties:
            prop_uri = NFC[prop_name]
            self.ontology_graph.add((prop_uri, RDF.type, RDF.Property))
            self.ontology_graph.add((prop_uri, RDFS.label, Literal(prop_name)))
            self.ontology_graph.add((prop_uri, RDFS.comment, Literal(description)))
    
    def _load_shapes(self) -> None:
        """Load SHACL shapes for NF C 15-100 validation."""
        try:
            possible_paths = [
                Path(self.settings.shapes_path)
            ]
            
            shapes_loaded = False
            for shapes_path in possible_paths:
                if shapes_path.exists():
                    self.shapes_graph.parse(str(shapes_path), format="turtle")
                    logger.info(f"✅ Loaded SHACL shapes from {shapes_path} ({len(self.shapes_graph)} triples)")
                    shapes_loaded = True
                    break
            
            if not shapes_loaded:
                logger.error(f"❌ SHACL shapes file not found in any of these paths: {[str(p) for p in possible_paths]}")
                
        except Exception as e:
            logger.error(f"❌ Error loading SHACL shapes: {e}")
    
    def validate_file(self, file_path: str, focus_area: Optional[str] = None) -> ValidationResult:
        """
        Validate electrical installation from TTL file.
        
        Args:
            file_path: Path to TTL file containing installation data
            focus_area: Optional focus area to filter relevant rules
            
        Returns:
            ValidationResult with validation details
        """
        try:
            # Load TTL file into graph
            data_graph = Graph()
            data_graph.parse(file_path, format="turtle")
            
            # Convert to JSON-LD for validation
            jsonld_data = data_graph.serialize(format="json-ld")
            import json
            jsonld_dict = json.loads(jsonld_data)
            
            # Use async validation method synchronously
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                result = loop.run_until_complete(self.validate(jsonld_dict, focus_area))
                return result
            finally:
                loop.close()
                
        except Exception as e:
            logger.error(f"Erreur de validation du fichier : {e}")
            return ValidationResult(
                is_valid=False,
                violations=[
                    ValidationViolation(
                        violation_id=str(uuid.uuid4()),
                        rule_id="FILE-ERROR",
                        severity=SeverityLevel.ERROR,
                        violation_type=ViolationType.SAFETY,
                        message=f"Erreur de validation du fichier : {str(e)}",
                        suggested_fix="Vérifiez le format et le chemin du fichier"
                    )
                ],
                rules_checked=[],
                validation_time_ms=0
            )

    async def validate_installation(self, jsonld_data: Dict[str, Any], focus_area: Optional[str] = None) -> ValidationResult:
        """
        Validate electrical installation data against NF C 15-100 standards.
        
        Args:
            jsonld_data: JSON-LD representation of electrical installation
            focus_area: Optional focus area (e.g., "heating") to filter relevant rules
            
        Returns:
            ValidationResult with validation details
        """
        return await self.validate(jsonld_data, focus_area)
    
    async def validate(self, jsonld_data: Dict[str, Any], focus_area: Optional[str] = None) -> ValidationResult:
        """
        Validate electrical installation data against NF C 15-100 standards.
        
        Args:
            jsonld_data: JSON-LD representation of electrical installation
            focus_area: Optional focus area (e.g., "room-equipment") to filter rules
            
        Returns:
            ValidationResult with validation details
        """
        start_time = time.time()
        
        try:
            # Convert JSON-LD to RDF graph 
            data_graph = Graph()
            
            # Parse JSON-LD data
            json_str = json.dumps(jsonld_data)
            data_graph.parse(data=json_str, format="json-ld")
            
            # Filter shapes based on focus_area
            filtered_shapes_graph = self._filter_shapes_by_focus_area(self.shapes_graph, focus_area)
            
            logger.info(f"📊 Parsed data graph with {len(data_graph)} triples")
            logger.info(f"📋 SHACL shapes graph has {len(filtered_shapes_graph)} triples (filtered from {len(self.shapes_graph)})")
            logger.info(f"🏗️ Ontology graph has {len(self.ontology_graph)} triples")
            
            # Debug: Print some triples from data graph
            if self.settings.debug:
                logger.info("🔍 Sample data triples:")
                for i, (s, p, o) in enumerate(data_graph):
                    if i < 5:  # Show first 5 triples
                        logger.info(f"  {s} {p} {o}")
                    else:
                        break
            
            # Perform SHACL validation with filtered shapes
            validation_result = validate(
                data_graph=data_graph,
                shacl_graph=filtered_shapes_graph,
                ont_graph=self.ontology_graph,
                inference='rdfs',
                debug=self.settings.debug
            )
            
            # Check if validation failed completely (returns ValidationFailure object)
            if hasattr(validation_result, 'validation_errors'):
                # Handle ValidationFailure case
                logger.error(f"❌ SHACL validation failed with errors: {validation_result.validation_errors}")
                raise Exception(f"SHACL validation failed: {validation_result.validation_errors}")
            
            # Normal case: unpack the tuple
            conforms, results_graph, results_text = validation_result
            
            logger.info(f"🎯 SHACL validation result: conforms={conforms}")
            
            # Safe length check for results_graph
            try:
                graph_len = len(results_graph) if results_graph else 0
                logger.info(f"📝 Results graph has {graph_len} triples")
            except Exception as graph_error:
                logger.warning(f"⚠️  Could not get results graph length: {graph_error}")
                
            if results_text:
                logger.info(f"📄 Results text: {results_text[:500]}...")  # First 500 chars
            
            # Process validation results
            violations = self._process_shacl_results(results_graph)
            
            validation_time = (time.time() - start_time) * 1000  # Convert to milliseconds
            
            return ValidationResult(
                is_valid=conforms and len(violations) == 0,
                violations=violations,
                rules_checked=list(self.rules_info.keys()),
                validation_time_ms=validation_time
            )
            
        except Exception as e:
            logger.error(f"Erreur du système de validation : {e}")
            return ValidationResult(
                is_valid=False,
                violations=[
                    ValidationViolation(
                        violation_id=str(uuid.uuid4()),
                        rule_id="SYSTEM-ERROR",
                        severity=SeverityLevel.ERROR,
                        violation_type=ViolationType.SAFETY,
                        message=f"Erreur du système de validation : {str(e)}",
                        suggested_fix="Vérifiez le format des données et réessayez"
                    )
                ],
                rules_checked=[],
                validation_time_ms=(time.time() - start_time) * 1000
            )
    
    def _process_shacl_results(self, results_graph: Graph) -> List[ValidationViolation]:
        """Process SHACL validation results into violation objects."""
        violations = []
        SH = Namespace("http://www.w3.org/ns/shacl#")
        
        # Query for validation results
        query = """
        PREFIX sh: <http://www.w3.org/ns/shacl#>
        SELECT ?result ?focusNode ?resultPath ?value ?message ?severity
        WHERE {
            ?result a sh:ValidationResult ;
                    sh:focusNode ?focusNode ;
                    sh:resultMessage ?message .
            OPTIONAL { ?result sh:resultPath ?resultPath }
            OPTIONAL { ?result sh:value ?value }
            OPTIONAL { ?result sh:resultSeverity ?severity }
        }
        """
        
        for row in results_graph.query(query):
            message = str(row[4]) if row[4] else "Validation failed"
            
            # (Filtrage supprimé) On ne masque plus les violations IPX4
            # if "IPX4" in message:
            #     continue
                
            violation = ValidationViolation(
                violation_id=str(uuid.uuid4()),
                rule_id=self._map_focus_to_rule(str(row[1]) if row[1] else ""),
                severity=self._map_severity(str(row[5]) if row[5] else ""),
                violation_type=ViolationType.INSTALLATION,
                message=message,
                focus_node=str(row[1]) if row[1] else None,
                path=str(row[2]) if row[2] else None,
                value=str(row[3]) if row[3] else None,  # row[3] is value
                suggested_fix=self._generate_suggested_fix(message)
            )
            violations.append(violation)
        
        return violations
    
    def _map_focus_to_rule(self, focus_node: str) -> str:
        """Map SHACL focus node to NF C 15-100 rule ID."""
        if "Kitchen" in focus_node:
            return "NFC-15-100-KITCHEN-001"
        elif "Socket" in focus_node:
            return "NFC-15-100-SOCKET-001"
        else:
            return "NFC-15-100-GENERIC"
    
    def _map_severity(self, severity_uri: str) -> SeverityLevel:
        """Map SHACL severity to our severity levels."""
        if "Violation" in severity_uri or "Error" in severity_uri:
            return SeverityLevel.ERROR
        elif "Warning" in severity_uri:
            return SeverityLevel.WARNING
        else:
            return SeverityLevel.INFO
    
    def _generate_suggested_fix(self, message: str) -> str:
        """Generate suggested fix based on violation message."""
        lower_msg = message.lower()
        # Priorité : circuits spéciaux (20 A + 32 A)
        if "circuits spéciaux" in lower_msg and ("20a" in lower_msg or "32a" in lower_msg):
            return "Ajoutez au moins 3 prises spécialisées 20A et 1 prise 32A pour plaque de cuisson dans la cuisine, salle de bain ou circulation et locaux ≥ 4 m²"

        if "socket" in lower_msg or "prise" in lower_msg:
            # Kitchen rules
            if "3 prises" in lower_msg and ("cuisine" in lower_msg or "cuisine" in lower_msg):
                return "Ajoutez des prises supplémentaires afin d'atteindre le minimum de 3 prises exigé pour les petites cuisines (<4m²)"
            elif "6 prises" in lower_msg and "cuisine" in lower_msg:
                return "Ajoutez des prises supplémentaires afin d'atteindre le minimum de 6 prises exigé pour les cuisines de 4m² et plus"
            # Living room rules
            elif "5 prises" in lower_msg and "salon" in lower_msg:
                return "Ajoutez des prises supplémentaires afin d'atteindre le minimum de 5 prises exigé pour les salons ≤20m²"
            elif "6 prises" in lower_msg and "salon" in lower_msg:
                return "Ajoutez des prises supplémentaires afin d'atteindre le minimum de 6 prises exigé pour les salons de 20-24m²"
            elif "7 prises" in lower_msg and "salon" in lower_msg:
                return "Ajoutez des prises supplémentaires afin d'atteindre le minimum de 7 prises exigé pour les salons >24m²"
            # Wet room rules
            elif ("salle d'eau" in lower_msg or "salle d'eau avec wc" in lower_msg) and "prise" in lower_msg:
                return "Ajoutez 1 prise supplémentaire dans la salle d'eau"
            else:
                return "Vérifiez le nombre de prises requis selon le type de pièce et sa superficie"
        elif "height" in lower_msg and "5cm" in lower_msg:
            return "Ajustez la hauteur de la prise pour qu'elle soit d'au moins 5 cm au-dessus du sol"
        elif ("salle d'eau" in lower_msg or "salle d'eau avec wc" in lower_msg) and ("éclairage" in lower_msg or "lighting" in lower_msg):
            return "Ajoutez 1 point d'éclairage dans la salle d'eau"
        elif ("salle d'eau" in lower_msg or "salle d'eau avec wc" in lower_msg) and "interrupteur" in lower_msg:
            return "Ajoutez 1 interrupteur pour l'éclairage dans la salle d'eau"
        else:
            return "Consultez la norme NF C 15-100 pour les exigences spécifiques"
    
    def get_rules_info(self) -> Dict[str, Any]:
        """Get information about available validation rules."""
        return {
            "total_rules": len(self.rules_info),
            "rules": {rule_id: rule_info.dict() for rule_id, rule_info in self.rules_info.items()},
            "categories": list(set(rule.category for rule in self.rules_info.values()))
        }
    
    def get_ontology_info(self) -> Dict[str, Any]:
        """Get information about the ontology structure."""
        classes = []
        properties = []
        
        # Query ontology for classes
        for subj, pred, obj in self.ontology_graph.triples((None, RDF.type, RDFS.Class)):
            label = self.ontology_graph.value(subj, RDFS.label, default="")
            comment = self.ontology_graph.value(subj, RDFS.comment, default="")
            
            classes.append(OntologyClass(
                class_uri=str(subj),
                label=str(label),
                description=str(comment) if comment else None,
                parent_classes=[],
                properties=[]
            ))
        
        # Query ontology for properties
        for subj, pred, obj in self.ontology_graph.triples((None, RDF.type, RDF.Property)):
            label = self.ontology_graph.value(subj, RDFS.label, default="")
            comment = self.ontology_graph.value(subj, RDFS.comment, default="")
            
            properties.append(OntologyProperty(
                property_uri=str(subj),
                label=str(label),
                description=str(comment) if comment else None
            ))
        
        return {
            "classes": [cls.dict() for cls in classes],
            "properties": [prop.dict() for prop in properties],
            "total_classes": len(classes),
            "total_properties": len(properties)
        }

    
    async def validate_room_equipment(self, rooms: List[RoomEquipment], include_dimensioning_rules: bool = False) -> tuple[GlobalComplianceResult, List[RoomComplianceResult]]:
        """Validate equipment for all rooms **via SHACL shapes**.

        The simplified `rooms` payload (list of `RoomEquipment`) is converted on the fly into a
        JSON-LD graph compatible with the ontology.  We then delegate the evaluation to
        `NFC15100Validator`, with optional filtering for dimensioning rules.
        
        Args:
            rooms: List of room equipment configurations
            include_dimensioning_rules: If False, exclude dimensioning rules (for room-equipment validation)
                                      If True, include all rules (for global validation)
        """

        import asyncio

        # ----------------------------------
        # 1. Build a JSON-LD representation
        # ----------------------------------
        installation_id = str(uuid.uuid4())

        jsonld_data: Dict[str, Any] = {
            "@context": {
                "@vocab": "http://ontology.nfc15100.fr#",
            },
            "@id": installation_id,
            "@type": "ElectricalInstallation",
            "hasRoom": []
        }

        # Quick helper for blank nodes so that every equipment instance is unique
        bnode_counter = 0

        def _new_bnode(prefix: str) -> str:
            nonlocal bnode_counter
            bnode_counter += 1
            return f"_:_{prefix}{bnode_counter}"

        equipment_to_prop = {
            EquipmentType.SOCKET: "hasSocket",
            EquipmentType.NETWORK_SOCKET: "hasNetworkSocket",
            EquipmentType.LIGHTING_POINT: "hasLightingPoint",
            EquipmentType.SWITCH: "hasSwitch",
            EquipmentType.SPECIALIZED_EQUIPMENT: "hasSpecializedEquipment",
        }

        for room in rooms:
            room_type_str = room.room_type.value if hasattr(room.room_type, "value") else str(room.room_type)

            room_dict: Dict[str, Any] = {
                "@id": room.room_id,
                "@type": room_type_str,
            }

            if room.room_area is not None:
                room_dict["roomArea"] = room.room_area

            # Add equipment instances
            for item in room.equipment:
                eq_type_raw = item.equipment_type if hasattr(item.equipment_type, "value") else item.equipment_type
                eq_type = EquipmentType(eq_type_raw) if isinstance(eq_type_raw, str) else eq_type_raw

                parent_eq_type = self._map_to_parent_equipment_type(eq_type)
                prop = equipment_to_prop.get(parent_eq_type)
                if not prop:
                    continue  # Ignore unsupported equipment types for now

                room_dict.setdefault(prop, [])
                # ----------------- Socket multiplication ------------------
                # A double / triple outlet physically embeds 2 or 3 normal
                # 2P+T sockets. To keep SHACL rules simple we materialise each
                # individual plug as its own `Socket` node so that cardinality
                # constraints are evaluated correctly.
                multiplier = 1
                if eq_type == EquipmentType.DOUBLE_SOCKET:
                    multiplier = 2
                elif eq_type == EquipmentType.TRIPLE_SOCKET:
                    multiplier = 3

                for _ in range(item.quantity * multiplier):
                    equipment_dict = {
                        "@id": _new_bnode(prop),
                        "@type": parent_eq_type.value if hasattr(parent_eq_type, "value") else str(parent_eq_type)
                    }

                    # Ajout d'attributs techniques si la prise est spécialisée
                    if parent_eq_type == EquipmentType.SOCKET:
                        # Récupère les specs fournies (peut être None ou non-dict)
                        specs = item.specifications if isinstance(item.specifications, dict) else {}
                        current = specs.get("current")
                        socket_type = specs.get("socketType")

                        # Cas prise plaque (OvenSocket) → 32 A par défaut
                        if eq_type == EquipmentType.OVEN_SOCKET:
                            current = current or 32
                            socket_type = socket_type or "32A"

                        # Cas prise hotte (ExtractorSocket) → prise simple 16 A sur circuit dédié
                        if eq_type == EquipmentType.EXTRACTOR_SOCKET:
                            current = current or 16
                            socket_type = socket_type or "2P+T"

                        # Cas prise simple 20A dédiée (Dedicated20ASocket)
                        if eq_type == EquipmentType.DEDICATED_20A_SOCKET:
                            current = current or 20
                            socket_type = socket_type or "20A"  # Marquer comme 20A pour exclure du minimum de prises cuisine

                        # Autres prises spécialisées (≠ simple/double) → 20 A par défaut
                        specialised_socket_types = {
                            EquipmentType.OVEN_SOCKET,
                            EquipmentType.HIGH_CURRENT_SOCKET,
                            EquipmentType.TV_SOCKET
                        }
                        if eq_type in specialised_socket_types and (current is None and socket_type is None):
                            current = 20
                            socket_type = "20A"

                        if current is not None:
                            equipment_dict["current"] = current
                        if socket_type is not None:
                            equipment_dict["socketType"] = socket_type

                    room_dict[prop].append(equipment_dict)

            jsonld_data["hasRoom"].append(room_dict)

        # ----------------------------------
        # 2. Delegate to SHACL validator with appropriate focus
        # ----------------------------------
        shacl_validator = NFC15100Validator()
        focus_area = None if include_dimensioning_rules else "room-equipment"
        validation_result = await shacl_validator.validate(jsonld_data, focus_area=focus_area)

        # ----------------------------------
        # 3. Group violations per room so that existing response models stay intact
        # ----------------------------------
        room_results: List[RoomComplianceResult] = []
        violations_by_room: Dict[str, List[ValidationViolation]] = {}
        global_violations: List[ValidationViolation] = []

        # Build mapping of room IDs for substring matching in focus_node URIs
        room_ids = [r.room_id for r in rooms]

        for v in validation_result.violations or []:
            assigned = False
            if v.focus_node:
                # Check if focus_node contains any room ID as substring
                for rid in room_ids:
                    if rid in v.focus_node:
                        violations_by_room.setdefault(rid, []).append(v)
                        assigned = True
                        break
            
            if not assigned:
                global_violations.append(v)

        for room in rooms:
            r_violations = violations_by_room.get(room.room_id, [])
            status = ComplianceStatus.COMPLIANT
            if any(v.severity == SeverityLevel.ERROR for v in r_violations):
                status = ComplianceStatus.NON_COMPLIANT
            elif any(v.severity == SeverityLevel.WARNING for v in r_violations):
                status = ComplianceStatus.WARNING

            room_results.append(RoomComplianceResult(
                room_id=room.room_id,
                room_type=room.room_type,
                compliance_status=status,
                violations=r_violations,
                warnings=[],
                missing_equipment=self._extract_missing_equipment(r_violations, room)
            ))

        overall_status = ComplianceStatus.COMPLIANT if validation_result.is_valid else ComplianceStatus.NON_COMPLIANT

        global_result = GlobalComplianceResult(
            overall_status=overall_status,
            violations=global_violations,
            warnings=[],
            missing_equipment_summary=[]
        )

        return global_result, room_results
    
    def _map_to_parent_equipment_type(self, equipment_type: EquipmentType) -> EquipmentType:
        """Map equipment subclasses to their parent classes for validation purposes."""
        # Socket subclasses -> Socket
        socket_subclasses = {
            EquipmentType.SIMPLE_SOCKET, EquipmentType.DOUBLE_SOCKET, EquipmentType.TRIPLE_SOCKET,
            EquipmentType.WATERPROOF_SOCKET, EquipmentType.CHILDPROOF_SOCKET, EquipmentType.USB_SOCKET,
            EquipmentType.HIGH_CURRENT_SOCKET, EquipmentType.TV_SOCKET, EquipmentType.OVEN_SOCKET,
            EquipmentType.EXTRACTOR_SOCKET, EquipmentType.DEDICATED_20A_SOCKET
        }
        
        # Switch subclasses -> Switch
        switch_subclasses = {
            EquipmentType.SIMPLE_SWITCH, EquipmentType.DOUBLE_SWITCH, EquipmentType.TRIPLE_SWITCH,
            EquipmentType.DIM_SWITCH, EquipmentType.MOTION_SENSOR_SWITCH, EquipmentType.REMOTE_SWITCH,
            EquipmentType.TIMER_SWITCH
        }
        
        # Lighting subclasses -> LightingPoint
        lighting_subclasses = {
            EquipmentType.CEILING_LIGHTING, EquipmentType.WALL_LIGHTING, EquipmentType.SPOT_LIGHTING,
            EquipmentType.EMERGENCY_LIGHTING, EquipmentType.EXTERIOR_LIGHTING
        }
        
        # Network subclasses -> NetworkSocket
        network_subclasses = {
            EquipmentType.RJ45_SOCKET, EquipmentType.FIBER_SOCKET, EquipmentType.COAX_SOCKET
        }
        
        # Specialized equipment subclasses -> SpecializedEquipment
        specialized_subclasses = {
            # Parent categories
            EquipmentType.ELECTRIC_HEATING, EquipmentType.WATER_HEATER, EquipmentType.VENTILATION,
            EquipmentType.ALARM_SYSTEM, EquipmentType.INTERCOM,
            # Additional specialized equipment
            EquipmentType.ELECTRIC_OVEN, EquipmentType.DISHWASHER, EquipmentType.WASHING_MACHINE,
            EquipmentType.DRYER, EquipmentType.COOKING_HOB, EquipmentType.AIR_CONDITIONING,
            EquipmentType.CONVECTOR, EquipmentType.INERTIA_RADIATOR, EquipmentType.FLOOR_HEATING,
            EquipmentType.DUCTED_HEAT_PUMP, EquipmentType.ELECTRIC_WATER_HEATER,
            EquipmentType.INSTANTANEOUS_WATER_HEATER, EquipmentType.STORAGE_WATER_HEATER,
            EquipmentType.VMC, EquipmentType.SIMPLE_FLOW_VMC, EquipmentType.DOUBLE_FLOW_VMC
        }
        
        # Map to parent classes
        if equipment_type in socket_subclasses:
            return EquipmentType.SOCKET
        elif equipment_type in switch_subclasses:
            return EquipmentType.SWITCH
        elif equipment_type in lighting_subclasses:
            return EquipmentType.LIGHTING_POINT
        elif equipment_type in network_subclasses:
            return EquipmentType.NETWORK_SOCKET
        elif equipment_type in specialized_subclasses:
            return EquipmentType.SPECIALIZED_EQUIPMENT
        else:
            # Return as-is if it's already a parent class or unknown (will be handled elsewhere)
            return equipment_type
    
    def calculate_dimensioning(
        self,
        rooms: List[RoomEquipment],
        global_compliance: GlobalComplianceResult,
        postal_code: Optional[str] | None = None,
        number_of_people: Optional[int] | None = None,
    ) -> DimensioningResult:
        """Calculate electrical dimensioning for an installation."""
        circuit_breakers = []
        surge_protectors = []
        electrical_panels = []
        cables = []
        installation_notes = []

        total_equipment = {}
        heating_areas: dict[EquipmentType, float] = {}
        # Nouvelle structure pour stocker les équipements de chauffage individuels (un circuit par équipement)
        individual_heating_equipment: list[tuple[EquipmentType, float, str]] = []  # (type, area, room_id)
        heating_types_set = set(self.HEATING_AREA_RATING_MAP.keys())
        # Types de chauffage nécessitant un circuit par équipement
        individual_circuit_heating_types = {EquipmentType.CONVECTOR, EquipmentType.INERTIA_RADIATOR}
        total_living_area = 0.0
        non_living_room_types = {RoomType.OTHER, RoomType.EXTERIOR_SPACE}

        for room in rooms:
            if room.room_type not in non_living_room_types:
                total_living_area += room.room_area or 0.0
            
            for equipment in room.equipment:
                eq_type = equipment.equipment_type if hasattr(equipment.equipment_type, 'value') else equipment.equipment_type
                try:
                    eq_type_enum = EquipmentType(eq_type)
                except ValueError:
                    eq_type_enum = EquipmentType.SPECIALIZED_EQUIPMENT

                if eq_type_enum in heating_types_set and equipment.quantity > 0:
                    # Pour les convecteurs et radiateurs à inertie : un circuit par équipement
                    if eq_type_enum in individual_circuit_heating_types:
                        for _ in range(equipment.quantity):
                            individual_heating_equipment.append((eq_type_enum, room.room_area or 0.0, room.room_id))
                    else:
                        # Pour les autres types de chauffage : logique agrégée conservée
                        heating_areas[eq_type_enum] = heating_areas.get(eq_type_enum, 0.0) + (room.room_area or 0.0)

                # Compteurs spécifiques pour TV et coaxial (pour les câbles)
                if eq_type_enum == EquipmentType.TV_SOCKET:
                    total_equipment[EquipmentType.TV_SOCKET] = total_equipment.get(EquipmentType.TV_SOCKET, 0) + equipment.quantity
                elif eq_type_enum == EquipmentType.COAX_SOCKET:
                    total_equipment[EquipmentType.COAX_SOCKET] = total_equipment.get(EquipmentType.COAX_SOCKET, 0) + equipment.quantity

                # Mapping vers les types parents (pour les disjoncteurs)
                parent_type = self._map_to_parent_equipment_type(eq_type_enum)
                total_equipment[parent_type] = total_equipment.get(parent_type, 0) + equipment.quantity
        
        circuit_breakers.extend(
            self._calculate_circuit_breakers(total_equipment, rooms, number_of_people, heating_areas, total_living_area, individual_heating_equipment)
        )
        
        # ------------------------------------------------------------------
        #  Surge protector (SPD) calculation – only in lightning-risk areas  
        # ------------------------------------------------------------------

        # 1) Determine if SPD is mandatory
        # NF C 15-100 makes the SPD mandatory when the installation is located
        # in départements where the lightning density Ng > 2.5. The list below
        # comes from the « Guide UTE C 15-443 » and covers the départements
        # officially classified as "à risque foudre".
        risk_departments: set[str] = {
            "01", "03", "04", "05", "06", "07", "09", "11", "12", "13",
            "14", "15", "16", "17", "19", "2A", "2B", "21", "23", "24",
            "26", "27", "28", "30", "31", "32", "33", "34", "35", "36",
            "37", "38", "39", "40", "41", "42", "43", "44", "45", "46",
            "47", "48", "49", "50", "52", "53", "56", "57", "58", "59",
            "60", "61", "62", "63", "64", "65", "66", "67", "68", "69",
            "70", "71", "72", "73", "74", "79", "80", "81", "82", "83",
            "84", "85", "86", "87", "88", "89", "90"
        }

        spd_required = True  # Conservative default

        if postal_code:
            # Extract the département number (first two characters, except for
            # Corsica where it can be 2A/2B)
            dept_code = postal_code.strip()[:2].upper()

            # Special handling for Corsica postal codes (20 000 – 20 199 = 2A,
            # 20 200 – 20 999 = 2B)
            if dept_code == "20":
                try:
                    last_three = int(postal_code[2:5])
                    dept_code = "2A" if last_three < 200 else "2B"
                except ValueError:
                    # If parsing fails, keep "20" which will not match
                    # the risk list – safer to keep default (SPD required).
                    dept_code = "20"

            spd_required = dept_code in risk_departments

        if spd_required:
            surge_protectors.append(
                SurgeProtectorSpec(
                    type="Parafoudre Type 2",
                    rating="10kA",
                    quantity=1,
                    description="Parafoudre du tableau électrique principal",
                )
            )
        
        # Calculate electrical panel requirements
        total_circuits = len(circuit_breakers)
        # NF C 15-100: 20% de réserve minimum (80% d'occupation maximum)
        # Calcul: circuits_nécessaires = circuits_utilisés / 0.8
        # Minimum 13 modules selon les standards de coffrets disponibles
        nfc_required_modules = math.ceil(total_circuits / 0.8)
        required_modules = max(13, nfc_required_modules)

        electrical_panels.append(ElectricalPanelSpec(
            type="Tableau électrique",
            modules=required_modules,
            quantity=1,
            description=f"Tableau électrique principal avec {required_modules} modules (NF C 15-100: 20% réserve minimum)"
        ))
        
        # Calculate cable requirements
        cables.extend(self._calculate_cables(rooms, total_equipment))
        
        # ------------------------------------------------------
        #  Additional installation notes (dimensioning warnings)
        # ------------------------------------------------------
        # Alertes pour les équipements de chauffage agrégés (non-individuels)
        for eq_enum, total_area in heating_areas.items():
            thresholds = self.HEATING_AREA_RATING_MAP.get(eq_enum)
            if not thresholds: continue
            max_surface_single = thresholds[-1][0]
            if total_area > max_surface_single:
                human_label = eq_enum.value.replace("_", " ").capitalize()
                installation_notes.append(
                    f"⚠️ La surface totale pour {human_label} ({total_area:.1f} m²) dépasse le maximum de {max_surface_single} m² pour un circuit unique. Un seul disjoncteur est proposé mais une étude plus approfondie ou une répartition sur plusieurs circuits est recommandée."
                )

        # Alertes pour les équipements de chauffage individuels
        if individual_heating_equipment:
            convector_count = sum(1 for eq_type, _, _ in individual_heating_equipment if eq_type == EquipmentType.CONVECTOR)
            radiator_count = sum(1 for eq_type, _, _ in individual_heating_equipment if eq_type == EquipmentType.INERTIA_RADIATOR)
            
            if convector_count > 0:
                installation_notes.append(f"✓ {convector_count} circuit(s) dédié(s) pour convecteurs (un circuit par équipement)")
            if radiator_count > 0:
                installation_notes.append(f"✓ {radiator_count} circuit(s) dédié(s) pour radiateurs à inertie (un circuit par équipement)")
                
            # Alerte générale pour les surfaces importantes
            large_rooms = [(eq_type, area) for eq_type, area, _ in individual_heating_equipment if area > (90 if eq_type == EquipmentType.CONVECTOR else 60)]
            if large_rooms:
                installation_notes.append("⚠️ Certains équipements de chauffage sont installés dans des pièces de grande superficie. Vérifiez que la puissance est adaptée.")

        # Add generic installation notes
        installation_notes.extend([
            "Tous les circuits doivent être protégés par un DDR 30 mA",
            "Sections des conducteurs : 1,5 mm² pour l'éclairage et les prises classiques 16A, 2,5 mm² minimum pour les circuits cuisine",
            "Les circuits dédiés de la cuisine nécessitent une protection 20 A",
            "Les circuits de la salle de bains nécessitent des indices de protection IP adaptés",
            "Les équipements spécialisés doivent avoir un circuit dédié",
        ])

        if not global_compliance.overall_status == ComplianceStatus.COMPLIANT:
            installation_notes.append("⚠️ Corrigez les non-conformités avant l'installation")
        
        return DimensioningResult(
            circuit_breakers=circuit_breakers,
            surge_protectors=surge_protectors,
            electrical_panels=electrical_panels,
            cables=cables,
            total_estimated_cost=None,  # Could be calculated based on component costs
            installation_notes=installation_notes
        )
    
    def _calculate_circuit_breakers(self, total_equipment: Dict, rooms: List[RoomEquipment], number_of_people: Optional[int] = None, heating_areas: dict[EquipmentType, float] | None = None, total_living_area: float = 0.0, individual_heating_equipment: list[tuple[EquipmentType, float, str]] | None = None) -> List[CircuitBreakerSpec]:
        breakers: list[CircuitBreakerSpec] = []

        def _to_enum(raw):
            if hasattr(raw, "value"): return raw
            try: return EquipmentType(raw)
            except Exception: return None

        # --- Définitions communes ---
        # Types de prises exclues (spécialisées)
        excluded_socket_types = {
            EquipmentType.DEDICATED_20A_SOCKET,
            EquipmentType.OVEN_SOCKET,
            EquipmentType.EXTRACTOR_SOCKET,
            EquipmentType.HIGH_CURRENT_SOCKET
        }

        # --- 1. Lighting ---
        # Nouveau dimensionnement : disjoncteurs 16A, division par 8 comme les prises
        lighting_points = total_equipment.get(EquipmentType.LIGHTING_POINT, 0)
        if lighting_points > 0:
            lighting_circuits = (lighting_points + 7) // 8  # Division par 8, arrondi supérieur
            for idx in range(lighting_circuits):
                breakers.append(CircuitBreakerSpec(rating=16, type="Type C", quantity=1, description=f"Disjoncteur éclairage 16A {idx + 1} (max 8 points lumineux)"))

        # --- 2. Count Regular Sockets (nouvelle logique) ---
        # Compter seulement les prises classiques (hors spécialisées et cuisines)
        # pour les typologies spécifiées
        total_regular_socket_count = 0
        
        # Types de pièces autorisées pour les prises classiques
        regular_socket_room_types = {
            RoomType.LIVING_ROOM,  # salon
            RoomType.BEDROOM,      # chambre
            RoomType.OFFICE,       # bureau
            RoomType.CIRCULATION_AREA,  # dégagement et locaux ≥ 4 m²
            RoomType.WET_ROOM,     # salle de bain
            RoomType.BATHROOM_WITH_WC,  # salle de bain avec WC
        }

        for room in rooms:
            # Vérifier si la pièce est dans les typologies autorisées
            if room.room_type in regular_socket_room_types:
                for equipment in room.equipment:
                    eq_enum = _to_enum(equipment.equipment_type)
                    if eq_enum is None: continue

                    # Compter les prises classiques seulement
                    if (self._map_to_parent_equipment_type(eq_enum) == EquipmentType.SOCKET and 
                        eq_enum not in excluded_socket_types):
                        total_regular_socket_count += equipment.quantity

        # --- 3. Circuits pour prises classiques : tous en 16A, max 8 prises par disjoncteur ---
        if total_regular_socket_count > 0:
            circuits_needed = (total_regular_socket_count + 7) // 8  # Division par 8, arrondi supérieur
            for idx in range(circuits_needed):
                breakers.append(CircuitBreakerSpec(
                    rating=16, 
                    type="Type C", 
                    quantity=1, 
                    description=f"Disjoncteur prises classiques 16A {idx + 1} (max 8 prises, section 1,5 mm²)"
                ))

        # --- 4. Circuits spécialisés et équipements dédiés (conservés) ---
        kitchen_socket_count = 0
        specialised_20a_count = 0
        cooking_hob_count = 0
        vmc_types_found: set[EquipmentType] = set()

        kitchen_room_types = {RoomType.KITCHEN, RoomType.LIVING_ROOM_WITH_INTEGRATED_KITCHEN}
        specialised_20a_types = {EquipmentType.DISHWASHER, EquipmentType.WASHING_MACHINE, EquipmentType.DRYER, EquipmentType.ELECTRIC_OVEN, EquipmentType.DEDICATED_20A_SOCKET}
        vmc_equipment_types = {EquipmentType.VMC, EquipmentType.SIMPLE_FLOW_VMC, EquipmentType.DOUBLE_FLOW_VMC}

        for room in rooms:
            for equipment in room.equipment:
                eq_enum = _to_enum(equipment.equipment_type)
                if eq_enum is None: continue

                # Count kitchen sockets (restent séparés)
                if (room.room_type in kitchen_room_types and 
                    self._map_to_parent_equipment_type(eq_enum) == EquipmentType.SOCKET and
                    eq_enum not in excluded_socket_types):
                    kitchen_socket_count += equipment.quantity
                
                # Count other specialized items
                if eq_enum in specialised_20a_types:
                    specialised_20a_count += equipment.quantity
                if eq_enum == EquipmentType.COOKING_HOB:
                    cooking_hob_count += equipment.quantity
                if eq_enum in vmc_equipment_types:
                    vmc_types_found.add(eq_enum)
        
        # Sockets (Kitchen): 20A, max 6 (conservé)
        if kitchen_socket_count > 0:
            kitchen_circuits_20a = max(1, (kitchen_socket_count + 5) // 6)
            for idx in range(kitchen_circuits_20a):
                breakers.append(CircuitBreakerSpec(rating=20, type="Type C", quantity=1, description=f"Disjoncteur prises cuisine {idx + 1} (max 6 prises)"))

        # Specialised 20A (min 3) (conservé)
        specialised_circuits_needed = max(3, specialised_20a_count)
        for idx in range(specialised_circuits_needed):
            breakers.append(CircuitBreakerSpec(rating=20, type="Type C", quantity=1, description=f"Circuit spécialisé 20A {idx + 1}"))

        # Prises plaque (OVEN_SOCKET) - 1 disjoncteur 32A par prise
        oven_socket_count = 0
        for room in rooms:
            for equipment in room.equipment:
                eq_enum = _to_enum(equipment.equipment_type)
                if eq_enum == EquipmentType.OVEN_SOCKET:
                    oven_socket_count += equipment.quantity
        
        for idx in range(oven_socket_count):
            breakers.append(CircuitBreakerSpec(rating=32, type="Type C", quantity=1, description=f"Circuit dédié prise plaque 32A {idx + 1}"))

        # Cooking Hob (seulement si pas de prises plaque dédiées)
        if oven_socket_count == 0 and cooking_hob_count > 0:
            hob_circuits = max(1, cooking_hob_count)
            for idx in range(hob_circuits):
                breakers.append(CircuitBreakerSpec(rating=32, type="Type C", quantity=1, description=f"Circuit dédié plaque de cuisson {idx + 1}"))

        # VMC Circuit
        if vmc_types_found:
            vmc_rating = 0
            vmc_type_str = ""
            if EquipmentType.DOUBLE_FLOW_VMC in vmc_types_found:
                vmc_type_str = "Double Flux"
                vmc_rating = 10 if total_living_area >= 120 else 6
            elif EquipmentType.SIMPLE_FLOW_VMC in vmc_types_found or EquipmentType.VMC in vmc_types_found:
                vmc_type_str = "Simple Flux"
                vmc_rating = 6 if total_living_area >= 120 else 2
            if vmc_rating > 0:
                breakers.append(CircuitBreakerSpec(rating=vmc_rating, type="Type C", quantity=1, description=f"Circuit VMC {vmc_type_str} - {vmc_rating}A"))

        # Heating (Aggregated for non-individual types)
        def _rating_from_area(eq_type: EquipmentType, area: float | None) -> int:
            if area is None or area <= 0: return 20
            thresholds = self.HEATING_AREA_RATING_MAP.get(eq_type)
            if thresholds:
                for max_area, rating in thresholds:
                    if area <= max_area: return rating
                return thresholds[-1][1]
            return 20

        # Circuits de chauffage agrégés (autres que convecteurs et radiateurs à inertie)
        if heating_areas:
            for eq_enum, total_area in heating_areas.items():
                if total_area <= 0: continue
                rating = _rating_from_area(eq_enum, total_area)
                breakers.append(CircuitBreakerSpec(rating=rating, type="Type C", quantity=1, description=f"Circuit {eq_enum.value} - {rating}A"))

        # Circuits de chauffage individuels (un circuit par équipement pour convecteurs et radiateurs à inertie)
        if individual_heating_equipment:
            equipment_counter = {}  # Pour numéroter les équipements du même type
            for eq_type, area, room_id in individual_heating_equipment:
                # Compter les équipements du même type pour la numérotation
                if eq_type not in equipment_counter:
                    equipment_counter[eq_type] = 0
                equipment_counter[eq_type] += 1
                
                rating = _rating_from_area(eq_type, area)
                eq_type_display = "Convecteur" if eq_type == EquipmentType.CONVECTOR else "Radiateur inertie"
                
                # Vérifier si la surface dépasse les limites recommandées
                thresholds = self.HEATING_AREA_RATING_MAP.get(eq_type)
                max_recommended_area = thresholds[-1][0] if thresholds else 60
                alert_suffix = ""
                if area > max_recommended_area:
                    alert_suffix = f" ⚠️ (superficie {area:.0f}m² > {max_recommended_area:.0f}m² recommandés)"
                
                breakers.append(CircuitBreakerSpec(
                    rating=rating, 
                    type="Type C", 
                    quantity=1, 
                    description=f"Circuit {eq_type_display} {equipment_counter[eq_type]} - {rating}A{alert_suffix}"
                ))
        
        # Remaining Specialised Equipment (that are not sockets or otherwise counted)
        heating_types_set = set(self.HEATING_AREA_RATING_MAP.keys())
        remaining_skip_set = specialised_20a_types | heating_types_set | vmc_equipment_types | {EquipmentType.COOKING_HOB, EquipmentType.DEDICATED_20A_SOCKET, EquipmentType.WATER_HEATER, EquipmentType.ELECTRIC_WATER_HEATER, EquipmentType.INSTANTANEOUS_WATER_HEATER, EquipmentType.STORAGE_WATER_HEATER} | excluded_socket_types

        for room in rooms:
            for equipment in room.equipment:
                eq_enum = _to_enum(equipment.equipment_type)
                if eq_enum is None or self._map_to_parent_equipment_type(eq_enum) != EquipmentType.SPECIALIZED_EQUIPMENT: continue
                if eq_enum in remaining_skip_set: continue
                power_w: float | None = None
                if hasattr(equipment, "specifications") and isinstance(equipment.specifications, dict):
                    p = equipment.specifications.get("power_w") or equipment.specifications.get("powerW")
                    if p is not None:
                        try: power_w = float(p)
                        except (TypeError, ValueError): power_w = None
                if power_w is None: power_w = self._get_typical_power_consumption(eq_enum)
                rating = self._determine_breaker_rating(power_w)
                for _ in range(equipment.quantity):
                    breakers.append(CircuitBreakerSpec(rating=rating, type="Type C", quantity=1, description=f"Circuit dédié {eq_enum.value} ({rating}A)"))

        # Water Heater
        def _wh_breaker_rating(n_people: int | None, area: float) -> int:
            if n_people is None: return 20
            if n_people <= 2: return 16
            elif n_people == 3: return 20 if area > 90 else 16
            elif n_people == 4: return 25 if area > 110 else 20
            else: return 25
        
        water_heater_types = {EquipmentType.WATER_HEATER, EquipmentType.ELECTRIC_WATER_HEATER, EquipmentType.INSTANTANEOUS_WATER_HEATER, EquipmentType.STORAGE_WATER_HEATER}
        for room in rooms:
            for equipment in room.equipment:
                eq_enum = _to_enum(equipment.equipment_type)
                if eq_enum not in water_heater_types: continue
                rating = _wh_breaker_rating(number_of_people, total_living_area)
                for _ in range(equipment.quantity):
                    breakers.append(CircuitBreakerSpec(rating=rating, type="Type C", quantity=1, description=f"Circuit chauffe-eau ({rating}A) pour {number_of_people or '?'} pers. et {total_living_area:.0f}m²"))
        
        return breakers
    
    def _get_typical_power_consumption(self, equipment_type) -> float:
        """Get typical power consumption in watts for equipment type."""
        power_map = {
            # Generic parents
            EquipmentType.SOCKET: 100,
            EquipmentType.NETWORK_SOCKET: 10,
            EquipmentType.LIGHTING_POINT: 60,
            EquipmentType.SWITCH: 0,
            EquipmentType.SPECIALIZED_EQUIPMENT: 2000,

            # Typical specialised loads (values in watts)
            EquipmentType.CONVECTOR: 1500,
            EquipmentType.INERTIA_RADIATOR: 1800,
            EquipmentType.AIR_CONDITIONING: 2500,
            EquipmentType.DUCTED_HEAT_PUMP: 3500,
            EquipmentType.FLOOR_HEATING: 3000,
            EquipmentType.WATER_HEATER: 3000,
            EquipmentType.SIMPLE_FLOW_VMC: 800,
            EquipmentType.DOUBLE_FLOW_VMC: 1200,
            EquipmentType.ELECTRIC_OVEN: 2500,
            EquipmentType.OVEN_SOCKET: 2500,
            EquipmentType.WASHING_MACHINE: 2200,
            EquipmentType.DRYER: 2600,
        }
        
        if isinstance(equipment_type, str):
            equipment_type = EquipmentType(equipment_type)
        
        return power_map.get(equipment_type, 100)
    
    def _calculate_cables(self, rooms: List[RoomEquipment], total_equipment: Dict) -> List[CableSpec]:
        """Calculate required cables.
        
        The previous implementation relied only on the **number** of lighting points,
        sockets, etc.  We now also consider the **surface area** of each room in order
        to scale the estimated cable lengths more realistically.  If no ``room_area``
        information is available, the function falls back to the legacy point-based
        estimation.
        
        This function now aggregates cables of the same type and section to avoid
        duplicate lines in the quote.
        """
        import math

        # Dictionary to aggregate cables by type and section
        cable_aggregator: dict[tuple[str, float], dict] = {}
        
        def add_cable(cable_type: str, section: float, length: float, description_parts: list[str]):
            """Add a cable to the aggregator, merging with existing cables of same type/section."""
            key = (cable_type, section)
            if key in cable_aggregator:
                cable_aggregator[key]['length'] += length
                cable_aggregator[key]['descriptions'].extend(description_parts)
            else:
                cable_aggregator[key] = {
                    'type': cable_type,
                    'section': section,
                    'length': length,
                    'descriptions': description_parts
                }

        # ------------------------------------------------------------------
        # 1. Main distribution cable (compteur → tableau) - SUPPRIMÉ
        # ------------------------------------------------------------------
        # Câble d'alimentation principale supprimé selon les nouvelles spécifications

        # Surface totale (m²) – ne tient compte que des pièces ayant une area
        total_area: float = sum((r.room_area or 0.0) for r in rooms)

        # ------------------------------------------------------------------
        # 2. Éclairage (1,5 mm²)
        # ------------------------------------------------------------------
        lighting_points: int = total_equipment.get(EquipmentType.LIGHTING_POINT, 0)
        if lighting_points > 0:
            # Référence historique : 15 m par point pour une pièce de ~15 m².
            # Si la surface totale est renseignée, on ajuste proportionnellement
            # (k ≈ 1 m de câble par m², plafonné au minimum à la valeur historique).
            if total_area > 0:
                length_estimate = max(lighting_points * 15.0, total_area * 0.8)
            else:
                length_estimate = lighting_points * 15.0

            length_estimate = int(math.ceil(length_estimate))
            add_cable("H07V-U", 1.5, length_estimate, [f"circuits éclairage – {lighting_points} point(s)"])

        # ------------------------------------------------------------------
        # 3. Prises de courant - séparées par type (cuisine vs classiques)
        # ------------------------------------------------------------------
        
        # Calculer les prises cuisine et classiques séparément
        kitchen_sockets = 0
        regular_sockets = 0
        
        kitchen_room_types = {RoomType.KITCHEN, RoomType.LIVING_ROOM_WITH_INTEGRATED_KITCHEN}
        regular_socket_room_types = {
            RoomType.LIVING_ROOM, RoomType.BEDROOM, RoomType.OFFICE,
            RoomType.CIRCULATION_AREA, RoomType.WET_ROOM, RoomType.BATHROOM_WITH_WC
        }
        excluded_socket_types = {
            EquipmentType.DEDICATED_20A_SOCKET, EquipmentType.OVEN_SOCKET,
            EquipmentType.EXTRACTOR_SOCKET, EquipmentType.HIGH_CURRENT_SOCKET
        }
        
        for room in rooms:
            for equipment in room.equipment:
                if hasattr(equipment.equipment_type, 'value'):
                    eq_type = equipment.equipment_type
                else:
                    try:
                        eq_type = EquipmentType(equipment.equipment_type)
                    except:
                        continue
                        
                if (self._map_to_parent_equipment_type(eq_type) == EquipmentType.SOCKET and 
                    eq_type not in excluded_socket_types):
                    if room.room_type in kitchen_room_types:
                        kitchen_sockets += equipment.quantity
                    elif room.room_type in regular_socket_room_types:
                        regular_sockets += equipment.quantity

        # Prises cuisine : 2,5 mm² (circuits 20A)
        if kitchen_sockets > 0:
            circuits = max(1, math.ceil(kitchen_sockets / 6))  # 6 prises max par circuit cuisine
            length_estimate = kitchen_sockets * 3.0 + circuits * 25.0  # Plus de câble pour 20A
            length_estimate = int(math.ceil(length_estimate))
            add_cable("H07V-U", 2.5, length_estimate, [f"circuits prises cuisine 20A – {kitchen_sockets} prise(s)"])

        if regular_sockets > 0:
            circuits = max(1, math.ceil(regular_sockets / 8))  # 8 prises max par circuit classique
            length_estimate = regular_sockets * 2.5 + circuits * 20.0
            length_estimate = int(math.ceil(length_estimate))
            add_cable("H07V-U", 1.5, length_estimate, [f"circuits prises classiques 16A – {regular_sockets} prise(s)"])

        # ------------------------------------------------------------------
        # 4. Réseau (Cat6)
        # ------------------------------------------------------------------
        network_sockets: int = total_equipment.get(EquipmentType.NETWORK_SOCKET, 0)
        if network_sockets > 0:
            if total_area > 0:
                length_estimate = max(network_sockets * 25.0, total_area * 0.5)
            else:
                length_estimate = network_sockets * 25.0

            length_estimate = int(math.ceil(length_estimate))
            add_cable("RJ45 Cat6 UTP", 0.0, length_estimate, [f"réseau – {network_sockets} prise(s) réseau"])

        # ------------------------------------------------------------------
        # 5. Télévision (Coaxial)
        # ------------------------------------------------------------------
        tv_sockets: int = total_equipment.get(EquipmentType.TV_SOCKET, 0)
        coax_sockets: int = total_equipment.get(EquipmentType.COAX_SOCKET, 0)
        total_tv_points = tv_sockets + coax_sockets
        
        if total_tv_points > 0:
            # Estimation : 20 m de câble coaxial par prise TV
            # Si surface connue, ajuster selon la taille du logement
            if total_area > 0:
                length_estimate = max(total_tv_points * 20.0, total_area * 0.4)
            else:
                length_estimate = total_tv_points * 20.0

            length_estimate = int(math.ceil(length_estimate))
            add_cable("Coaxial RG6", 0.0, length_estimate, [f"coaxiaux TV – {total_tv_points} prise(s) TV/coaxiale"])

        # ------------------------------------------------------------------
        # 6. Circuits spécialisés cuisine (4 mm²)
        # ------------------------------------------------------------------
        kitchen_rooms = [r for r in rooms if r.room_type.value == "Kitchen"]
        if kitchen_rooms:
            # Longueur : 4 m de câble par m² de cuisine, min 60 m (ancienne valeur)
            kitchen_area = sum((r.room_area or 0.0) for r in kitchen_rooms)
            if kitchen_area > 0:
                length_estimate = max(60.0, kitchen_area * 4.0)
            else:
                length_estimate = 60.0

            length_estimate = int(math.ceil(length_estimate))
            add_cable("H07V-U", 4.0, length_estimate, ["circuits dédiés cuisine (four, lave-vaisselle, plaque)"])

        # ------------------------------------------------------------------
        # 7. Prises plaque dédiées (6 mm²) - 1 câble par prise plaque
        # ------------------------------------------------------------------
        oven_socket_count = 0
        for room in rooms:
            for equipment in room.equipment:
                if hasattr(equipment.equipment_type, 'value'):
                    eq_type = equipment.equipment_type
                else:
                    try:
                        eq_type = EquipmentType(equipment.equipment_type)
                    except:
                        continue
                        
                if eq_type == EquipmentType.OVEN_SOCKET:
                    oven_socket_count += equipment.quantity

        if oven_socket_count > 0:
            # Estimation : 25 m de câble 6mm² par prise plaque 32A
            length_estimate = oven_socket_count * 25
            add_cable("H07V-U", 6.0, length_estimate, [f"circuits dédiés prises plaque 32A – {oven_socket_count} prise(s)"])

        # ------------------------------------------------------------------
        # 8. Convert aggregated cables to CableSpec objects
        # ------------------------------------------------------------------
        cables: list[CableSpec] = []
        for (cable_type, section), cable_data in cable_aggregator.items():
            # Merge descriptions
            merged_description = f"Câble {cable_type} {section}mm² – " + " + ".join(cable_data['descriptions'])
            if section == 0.0:  # Special case for network/coaxial cables
                merged_description = f"Câbles {cable_data['descriptions'][0]}"
            
            # Add surface area info if available
            if total_area > 0:
                merged_description += f" / {total_area:.0f} m²"
            
            cables.append(
                CableSpec(
                    section=section,
                    type=cable_type,
                    length_estimate=cable_data['length'],
                    description=merged_description,
                )
            )

        return cables

    def _extract_missing_equipment(self, violations: List[ValidationViolation], room: RoomEquipment) -> List[str]:
        """Parse SHACL violation messages to generate a human-readable list of missing equipment.
        Takes into account the existing equipment in the room to calculate the actual missing quantity.

        Expected front-end format examples:
            "2 sockets", "1 network socket", "3 lighting points", "1 switch"
        """
        import re

        missing: List[str] = []

        type_map = {
            'prise réseau': 'network socket',
            'prises réseau': 'network socket',
            'network socket': 'network socket',
            'prise 32a plaque': '32A socket',
            'prises 32a plaque': '32A socket',
            'prise 32a': '32A socket',
            'prises 32a': '32A socket',
            'prise': 'socket',
            'prises': 'socket',
            'socket': 'socket',
            'point lumineux': 'lighting point',
            'points lumineux': 'lighting point',
            'lighting point': 'lighting point',
            'point d\'éclairage': 'lighting point',
            'points d\'éclairage': 'lighting point',
            "point d'éclairage": 'lighting point',
            "points d'éclairage": 'lighting point',
            'éclairage': 'lighting point',
            'interrupteur': 'switch',
            'interrupteurs': 'switch',
            'switch': 'switch',
        }

        # Count existing equipment in the room
        existing_counts = self._count_existing_equipment(room)
        logger.info(f"🔧 Room {room.room_id} existing equipment counts: {existing_counts}")

        for v in violations:
            # Pattern 1: "…au moins X … (actuellement Y)" - with current count
            match_with_current = re.search(r"au moins\s+(\d+)\s+([\w\s\']+?)\s*(?:\(actuellement\s+(\d+)\)|$)", v.message, re.IGNORECASE)
            if match_with_current:
                required = int(match_with_current.group(1))
                current = int(match_with_current.group(3)) if match_with_current.group(3) else 0
                diff = required - current
                if diff > 0:
                    french_type = match_with_current.group(2).strip().lower()
                    french_type = re.sub(r"\s+", " ", french_type)
                    
                    english_type = self._map_french_to_english_equipment(french_type, type_map)
                    if english_type:
                        plural = 's' if diff > 1 and not english_type.endswith('s') else ''
                        missing.append(f"{diff} {english_type}{plural}")
                continue

            # Pattern 2: "…au moins X …" or "…disposer d'un X…" - without current count (calculate from existing equipment)
            # Examples: 
            # - "La cuisine doit comporter au moins 6 prises 2P+T conformément à la NF C 15-100"
            # - "La chambre doit comporter au moins 1 interrupteur pour le contrôle de l'éclairage (NF C 15-100)"
            # - "La chambre/bureau doit comporter au moins 1 point d'éclairage (NF C 15-100)"
            # - "Les zones de circulation de plus de 4 m² doivent disposer d'un point d'éclairage (NF C 15-100)"
            match_without_current = re.search(r"(?:au moins\s+(\d+)|disposer d'un)\s+([\w\s\/\'\"\-]+?)(?:\s+(?:2P\+T|pour|conformément|au-dessus|près|\()|$)", v.message, re.IGNORECASE)
            if match_without_current:
                # If "disposer d'un", assume required = 1; otherwise use captured number
                required = int(match_without_current.group(1)) if match_without_current.group(1) else 1
                french_type = match_without_current.group(2).strip().lower()
                french_type = re.sub(r"\s+", " ", french_type)
                
                logger.info(f"🔧 Pattern matched - Original: '{v.message}', Captured: '{french_type}'")
                english_type = self._map_french_to_english_equipment(french_type, type_map)
                logger.info(f"🔧 Mapping result: '{french_type}' -> '{english_type}'")
                
                if english_type:
                    # Get existing count for this equipment type
                    current = existing_counts.get(english_type, 0)
                    diff = required - current
                    logger.info(f"🔧 Equipment type '{english_type}': required={required}, current={current}, diff={diff}")
                    if diff > 0:
                        plural = 's' if diff > 1 and not english_type.endswith('s') else ''
                        missing.append(f"{diff} {english_type}{plural}")
                continue
            
            # Pattern 3: Special case for network socket recommendation
            # "Cette chambre devrait avoir une prise réseau (recommandation NF C 15-100)"
            if "prise réseau" in v.message.lower():
                current_network = existing_counts.get('network socket', 0)
                if current_network == 0:
                    missing.append("1 network socket")
                continue

        return missing
    
    def _count_existing_equipment(self, room: RoomEquipment) -> dict:
        """Count existing equipment in a room by type (English names).

        Normal socket counting rules (NF C 15-100):
        • Only standard 2P+T outlets (simple, waterproof, child-proof, USB…) are
          considered when verifying the minimum number of sockets.
        • Specialised/dedicated outlets (oven, extractor hood, 20 A dedicated,
          high-current, TV, etc.) must NOT be counted as standard sockets.
        • A double outlet counts for 2 standard sockets, a triple outlet for 3.
        """
        counts = {}

        # --- Helper for socket normalisation ---------------------------------
        NORMAL_SOCKET_TYPES: set[EquipmentType] = {
            EquipmentType.SIMPLE_SOCKET,
            EquipmentType.DOUBLE_SOCKET,
            EquipmentType.TRIPLE_SOCKET,
            EquipmentType.WATERPROOF_SOCKET,
            EquipmentType.CHILDPROOF_SOCKET,
            EquipmentType.USB_SOCKET,
        }

        for equipment in room.equipment:
            eq_type = equipment.equipment_type
            parent_type = self._map_to_parent_equipment_type(eq_type)

            # -------------------- SOCKETS -------------------------------------
            if parent_type == EquipmentType.SOCKET:
                # Count only *normal* sockets for the generic "socket" tally
                if eq_type in NORMAL_SOCKET_TYPES:
                    multiplier = 1
                    if eq_type == EquipmentType.DOUBLE_SOCKET:
                        multiplier = 2
                    elif eq_type == EquipmentType.TRIPLE_SOCKET:
                        multiplier = 3

                    counts['socket'] = counts.get('socket', 0) + equipment.quantity * multiplier
                
                # Count 32A sockets specifically (for cooktop requirement)
                if eq_type == EquipmentType.OVEN_SOCKET:
                    # Check if socket specs indicate 32A (default for OvenSocket)
                    specs = equipment.specifications if isinstance(equipment.specifications, dict) else {}
                    current = specs.get("current", 32)  # Default to 32A for oven socket
                    if current == 32:
                        counts['32A socket'] = counts.get('32A socket', 0) + equipment.quantity
                
                # Specialised sockets are purposely ignored for the generic
                # requirement counts (they may be checked by their own rules).
                continue

            # -------------------- NETWORK SOCKETS -----------------------------
            if parent_type == EquipmentType.NETWORK_SOCKET:
                counts['network socket'] = counts.get('network socket', 0) + equipment.quantity
                continue

            # -------------------- LIGHTING ------------------------------------
            if parent_type == EquipmentType.LIGHTING_POINT:
                counts['lighting point'] = counts.get('lighting point', 0) + equipment.quantity
                continue

            # -------------------- SWITCHES ------------------------------------
            if parent_type == EquipmentType.SWITCH:
                counts['switch'] = counts.get('switch', 0) + equipment.quantity
                continue

        return counts

    def _map_french_to_english_equipment(self, french_type: str, type_map: dict) -> str:
        """Map French equipment type to English equivalent."""
        # Direct lookup
        if french_type in type_map:
            return type_map[french_type]
        
        # Partial matching - prioritize longest/most specific matches first
        matches = []
        for k, v_t in type_map.items():
            if k in french_type or french_type in k:
                matches.append((k, v_t, len(k)))  # Store key, value, and key length
        
        # Sort by key length descending (longest/most specific first)
        matches.sort(key=lambda x: x[2], reverse=True)
        
        # Return the most specific match
        if matches:
            best_match = matches[0]
            logger.info(f"🔧 Best match for '{french_type}': '{best_match[0]}' -> '{best_match[1]}' (length: {best_match[2]})")
            return best_match[1]
        
        return None 

    def _filter_shapes_by_focus_area(self, shapes_graph: Graph, focus_area: Optional[str]) -> Graph:
        """Filter SHACL shapes based on the specified focus area.
        
        For room-equipment focus, exclude dimensioning-related rules like:
        - Technical specifications (references, cables, enclosures)
        - Circuit calculations (circuit counts, breaker sizing)
        - Global installation rules (grounding, lightning protection)
        """
        if focus_area != "room-equipment":
            # If not room-equipment focus, return all shapes
            return shapes_graph
            
        filtered_graph = Graph()
        
        # Copy namespace declarations
        for ns_prefix, ns_uri in shapes_graph.namespaces():
            filtered_graph.bind(ns_prefix, ns_uri)
        
        # Messages that indicate dimensioning rules to exclude
        dimensioning_keywords = [
            "Installation doit avoir système de mise à la terre",
            "Prise réseau doit utiliser référence SCH5520476",
            "Prise réseau doit utiliser boîte encastement EUR52061",
            "Prise réseau nécessite câble type RJ45",
            "Installation : circuits d'éclairage insuffisants",
            "L'installation électrique doit comporter au moins un circuit",
            "Installation : nombre de circuits 16A",
            "Évaluation du risque foudre obligatoire",
            "nécessite section câble",
            "doit utiliser référence SCH",
            "doit utiliser boîte encastement EUR",
            "circuits 16A (prises) inférieur",
            "circuits 16A (prises) insuffisant",
            "circuits d'éclairage insuffisants",
            "minimum 2 circuits d'éclairage",
            "Parafoudre obligatoire",
            "nombre de disjoncteurs",


            "Les équipements spécialisés doivent avoir un circuit dédié",
        ]
        
        # Query for shapes and their messages
        SH = Namespace("http://www.w3.org/ns/shacl#")
        SHAPES = Namespace("http://example.org/shapes#")
        
        # Get all shape nodes
        shape_nodes = set()
        for s, p, o in shapes_graph.triples((None, RDF.type, SH.NodeShape)):
            shape_nodes.add(s)
        
        for shape_node in shape_nodes:
            should_exclude = False
            
            # Check all messages in this shape
            for s, p, o in shapes_graph.triples((shape_node, None, None)):
                # Check nested property messages
                if p == SH.property:
                    for prop_s, prop_p, prop_o in shapes_graph.triples((o, None, None)):
                        if prop_p == SH.message and isinstance(prop_o, Literal):
                            message = str(prop_o)
                            if any(keyword in message for keyword in dimensioning_keywords):
                                should_exclude = True
                                break
                
                # Check SPARQL constraint messages
                if p == SH.sparql:
                    for sparql_s, sparql_p, sparql_o in shapes_graph.triples((o, None, None)):
                        if sparql_p == SH.message and isinstance(sparql_o, Literal):
                            message = str(sparql_o)
                            if any(keyword in message for keyword in dimensioning_keywords):
                                should_exclude = True
                                break
            
            # If this shape should be included, copy all its triples
            if not should_exclude:
                # Copy all triples related to this shape
                self._copy_shape_triples(shapes_graph, filtered_graph, shape_node)
        
        logger.info(f"🔍 Filtered shapes: kept {len(filtered_graph)} triples from {len(shapes_graph)} for focus_area={focus_area}")
        
        return filtered_graph
    
    def _copy_shape_triples(self, source_graph: Graph, target_graph: Graph, shape_node):
        """Recursively copy all triples related to a shape node."""
        SH = Namespace("http://www.w3.org/ns/shacl#")
        
        visited = set()
        
        def copy_node_triples(node):
            if node in visited:
                return
            visited.add(node)
            
            # Copy all triples where this node is the subject
            for s, p, o in source_graph.triples((node, None, None)):
                target_graph.add((s, p, o))
                
                # If object is a blank node, recursively copy its triples
                if isinstance(o, BNode):
                    copy_node_triples(o)
        
        copy_node_triples(shape_node) 

    def create_complete_installation_jsonld(
        self,
        rooms: List[RoomEquipment],
        dimensioning: DimensioningResult,
        postal_code: Optional[str] | None = None,
    ) -> Dict[str, Any]:
        """Create a complete JSON-LD representation including calculated dimensioning.
        
        This method creates a full electrical installation representation that includes:
        - Room equipment (from input)
        - Calculated circuits and protection devices
        - Grounding system
        - Lightning protection assessment
        - Technical specifications for equipment
        
        Args:
            rooms: List of room equipment configurations
            dimensioning: Calculated dimensioning result
            postal_code: Optional postal code for surge protector obligation rules
            
        Returns:
            Complete JSON-LD representation of the installation
        """
        installation_id = str(uuid.uuid4())
        
        jsonld_data: Dict[str, Any] = {
            "@context": {
                "@vocab": "http://ontology.nfc15100.fr#",
            },
            "@id": installation_id,
            "@type": "ElectricalInstallation",
            "hasRoom": [],
            "hasCircuit": [],
            "hasGroundingSystem": {
                "@id": f"{installation_id}_grounding",
                "@type": "GroundingSystem",
                "groundResistance": 50  # Typical value ≤ 100Ω
            },
            "lightningRiskAssessment": True,
            "hasSurgeProtector": []
        }
        
        # Quick helper for blank nodes
        bnode_counter = 0
        def _new_bnode(prefix: str) -> str:
            nonlocal bnode_counter
            bnode_counter += 1
            return f"_:{prefix}{bnode_counter}"
        
        equipment_to_prop = {
            EquipmentType.SOCKET: "hasSocket",
            EquipmentType.NETWORK_SOCKET: "hasNetworkSocket", 
            EquipmentType.LIGHTING_POINT: "hasLightingPoint",
            EquipmentType.SWITCH: "hasSwitch",
            EquipmentType.SPECIALIZED_EQUIPMENT: "hasSpecializedEquipment",
        }
        
        # Add rooms with equipment
        for room in rooms:
            room_type_str = room.room_type.value if hasattr(room.room_type, "value") else str(room.room_type)
            
            room_dict: Dict[str, Any] = {
                "@id": room.room_id,
                "@type": room_type_str,
            }
            
            if room.room_area is not None:
                room_dict["roomArea"] = room.room_area
            
            # Add equipment instances with technical specifications
            for item in room.equipment:
                eq_type_raw = item.equipment_type if hasattr(item.equipment_type, "value") else item.equipment_type
                eq_type = EquipmentType(eq_type_raw) if isinstance(eq_type_raw, str) else eq_type_raw
                
                parent_eq_type = self._map_to_parent_equipment_type(eq_type)
                prop = equipment_to_prop.get(parent_eq_type)
                if not prop:
                    continue
                
                room_dict.setdefault(prop, [])
                for _ in range(item.quantity):
                    equipment_dict = {
                        "@id": _new_bnode(prop),
                        "@type": parent_eq_type.value if hasattr(parent_eq_type, "value") else str(parent_eq_type)
                    }
                    
                    # Add technical specifications for network sockets
                    if parent_eq_type == EquipmentType.NETWORK_SOCKET:
                        equipment_dict.update({
                            "principalReference": "SCH5520476",
                            "enclosureBox": "EUR52061", 
                            "cableType": "RJ45"
                        })
                    
                    # Ajout d'attributs techniques si la prise est spécialisée
                    if parent_eq_type == EquipmentType.SOCKET:
                        # Récupère les specs fournies (peut être None ou non-dict)
                        specs = item.specifications if isinstance(item.specifications, dict) else {}
                        current = specs.get("current")
                        socket_type = specs.get("socketType")

                        # Cas prise plaque (OvenSocket) → 32 A par défaut
                        if eq_type == EquipmentType.OVEN_SOCKET:
                            current = current or 32
                            socket_type = socket_type or "32A"

                        # Cas prise hotte (ExtractorSocket) → prise simple 16 A sur circuit dédié
                        if eq_type == EquipmentType.EXTRACTOR_SOCKET:
                            current = current or 16
                            socket_type = socket_type or "2P+T"

                        # Cas prise simple 20A dédiée (Dedicated20ASocket)
                        if eq_type == EquipmentType.DEDICATED_20A_SOCKET:
                            current = current or 20
                            socket_type = socket_type or "20A"  # Marquer comme 20A pour exclure du minimum de prises cuisine

                        # Autres prises spécialisées (≠ simple/double) → 20 A par défaut
                        specialised_socket_types = {
                            EquipmentType.OVEN_SOCKET,
                            EquipmentType.HIGH_CURRENT_SOCKET,
                            EquipmentType.TV_SOCKET
                        }
                        if eq_type in specialised_socket_types and (current is None and socket_type is None):
                            current = 20
                            socket_type = "20A"

                        if current is not None:
                            equipment_dict["current"] = current
                        if socket_type is not None:
                            equipment_dict["socketType"] = socket_type
                    
                    room_dict[prop].append(equipment_dict)
            
            jsonld_data["hasRoom"].append(room_dict)
        
        # Add calculated circuits
        circuit_counter = 1
        lighting_points = sum(
            sum(eq.quantity for eq in room.equipment if eq.equipment_type == EquipmentType.LIGHTING_POINT)
            for room in rooms
        )
        socket_count = sum(
            sum(eq.quantity for eq in room.equipment if eq.equipment_type == EquipmentType.SIMPLE_SOCKET)
            for room in rooms
        )
        
        # Add lighting circuits
        for breaker in dimensioning.circuit_breakers:
            if "éclairage" in breaker.description.lower():
                circuit_id = f"{installation_id}_circuit_{circuit_counter}"
                circuit_counter += 1
                
                jsonld_data["hasCircuit"].append({
                    "@id": circuit_id,
                    "@type": "Circuit",
                    "circuitType": "lighting",
                    "hasProtection": {
                        "@id": f"{circuit_id}_protection", 
                        "@type": "CircuitBreaker",
                        "current": breaker.rating,
                        "type": breaker.type
                    }
                })
        
        # Add socket circuits  
        for breaker in dimensioning.circuit_breakers:
            if "prise" in breaker.description.lower() and "éclairage" not in breaker.description.lower():
                circuit_id = f"{installation_id}_circuit_{circuit_counter}"
                circuit_counter += 1
                
                jsonld_data["hasCircuit"].append({
                    "@id": circuit_id,
                    "@type": "Circuit", 
                    "circuitType": "socket",
                    "hasProtection": {
                        "@id": f"{circuit_id}_protection",
                        "@type": "CircuitBreaker",
                        "current": breaker.rating,
                        "type": breaker.type
                    }
                })
        
        # Add surge protectors
        for spd in dimensioning.surge_protectors:
            jsonld_data["hasSurgeProtector"].append({
                "@id": f"{installation_id}_spd_{spd.type.replace(' ', '_')}",
                "@type": "SurgeProtectionDevice",
                "protectionType": spd.type,
                "rating": spd.rating
            })
        
        # Add postal code if provided (used for surge protector obligation rules)
        if postal_code:
            jsonld_data["postalCode"] = postal_code
        
        return jsonld_data 

    def _determine_breaker_rating(self, power_w: float | None) -> int:
        """Return suitable breaker current (A) given appliance power in watts.

        Uses NF C 15-100 common sizing practice:
        – ≤ 3 680 W → 16 A
        – ≤ 4 600 W → 20 A
        – ≤ 7 360 W → 32 A
        – ≤ 9 200 W → 40 A
        – else      → 63 A
        If power is None, defaults to 20 A.
        """

        if power_w is None:
            return 20

        if power_w <= 3680:
            return 16
        elif power_w <= 4600:
            return 20
        elif power_w <= 7360:
            return 32
        elif power_w <= 9200:
            return 40
        else:
            return 63 