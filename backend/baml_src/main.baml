class FloorPlanAnalysis {
  rooms Room[] @description("List of all rooms in the floor plan")
  surface_loi_carrez float @description("Total Loi Carrez surface area for the entire property in square meters")
}

enum RoomType {
  Kitchen @description("Dedicated cooking space (Cuisine)")
  LivingRoom @description("Main living space (Salon/Séjour)")
  LivingRoomWithIntegratedKitchen @description("Open living space with integrated kitchen (Salon/Séjour avec cuisine intégré)")
  CirculationArea @description("Circulation spaces and utility rooms ≥ 4 m² (Circulation et locaux ≥ 4 m²)")
  WetRoom @description("Hygiene space without WC (Salle d'eau)")
  WC @description("Toilet space only (WC)")
  BathroomWithWC @description("Complete bathroom with WC (Salle d'eau avec WC)")
  Bedroom @description("Sleeping or office space (Chambre/Bureau)")
  Other @description("Miscellaneous spaces like garage, small circulation areas < 4 m², closets, etc. (Autres)")
  ExteriorSpace @description("Exterior spaces like terraces, patios, etc. (Extérieur)")
}

class Room {
  name string @description("Name of the room")
  surface float @description("Surface area in square meters") 
  roomType RoomType @description("Type of room according to NF C 15-100 ontology")
}

function AnalyzeMultipleFloorPlans(floorplans: image[]) -> FloorPlanAnalysis {
  client "openai/gpt-4.1-mini"
  prompt #"
    You are a precise architectural analyzer specialized in French residential floor plans. Your task is to analyze floor plans with 100% accuracy and room coverage.

    Core Analysis Process:
    1. SCAN PHASE
       - Systematically scan each floor plan from top-left to bottom-right
       - Mark each distinct enclosed space
       - Note all doors, windows, and fixed fixtures
       - Pay special attention to room corners and alcoves
    
    2. MEASUREMENT PHASE
       - Calculate surface area of each space in square meters
       - Include any recesses or alcoves in the measurements
       - For irregular shapes, break down into regular geometric shapes
       - Double-check all measurements
    
    3. CLASSIFICATION PHASE
       - Classify each space according to these rules:
         * Kitchen: Look for cooking fixtures, counters
         * LivingRoom: Largest open space without bed/kitchen fixtures
         * LivingRoomWithIntegratedKitchen: Open space with visible kitchen fixtures
         * CirculationArea: Hallways/landings > 4m², utility rooms, storage spaces
         * WetRoom: Bathroom fixtures without WC
         * WC: Toilet fixture only
         * BathroomWithWC: Both bathroom and toilet fixtures
         * Bedroom: Spaces suitable for beds, typically with windows
         * Other: Closets, small halls < 4m², garage
         * ExteriorSpace: Terraces, balconies, patios, covered terraces, porches

    4. VALIDATION CHECKS
       - Confirm every visible space is classified
       - Verify room connections are logical
       - Check total area matches approximate building footprint
       - Ensure no spaces are counted twice
       - Verify each room has appropriate access (doors)

    Special Instructions:
    - For studio apartments:
      * Main space MUST be LivingRoomWithIntegratedKitchen
      * Do not classify any space as Bedroom
      * Typically includes: main space, bathroom/WC, possibly circulation
    
    - For multiple floor plans:
      * Analyze each plan separately first
      * Combine all rooms into final list
      * Maintain consistent naming across plans
    
    Common Error Prevention:
    - Small spaces between rooms are usually circulation areas
    - Check for hidden alcoves in irregular walls
    - Verify that room classification matches typical French residential conventions
    - If uncertain about a space, mark it as Other with a note

    {{ ctx.output_format }}

    {{ _.role("user") }} {{ floorplans }}
  "#
}

test SingleFloorPlanTest {
  functions [AnalyzeMultipleFloorPlans]
  args {
    floorplans [
      {
        file "fixtures/plan-littoral.webp"
      }
    ]
  }
}

test MultipleFloorPlansTest {
  functions [AnalyzeMultipleFloorPlans]
  args {
    floorplans [
      {
        file "fixtures/plan-littoral.webp"
      },
      {
        file "fixtures/ecrin-bleu.webp"
      }
    ]
  }
}

test StudioFloorPlanTest {
  functions [AnalyzeMultipleFloorPlans]
  args {
    floorplans [
      {
        file "fixtures/studio.jpg"
      }
    ]
  }
}

test PlanLatest {
  functions [AnalyzeMultipleFloorPlans]
  args {
    floorplans [
      {
        file "fixtures/plan-latest.png"
      }
    ]
  }
}