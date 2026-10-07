import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

DEFAULT_DATASET_PATH = os.path.join(PROJECT_ROOT, 'dataset', 'corn_pest_dataset.csv')
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
TRAINED_MODELS_FOLDER = os.path.join(BASE_DIR, 'trained_models')
DATABASE_PATH = os.path.join(BASE_DIR, 'corn_pest.db')

DEFAULT_TARGET_COLUMN = 'Pest_Type'

# Configurable Risk Threshold Strategy
RISK_THRESHOLDS = {
    'LOW': (0.0, 0.39),
    'MEDIUM': (0.40, 0.69),
    'HIGH': (0.70, 1.00)
}

# Integrated Pest Management (IPM) General & Informational Recommendations
PEST_RECOMMENDATIONS = {
    'Fall Armyworm': {
        'description': 'Fall Armyworm (Spodoptera frugiperda) is a destructive pest that feeds on corn whorls and leaves.',
        'High': [
            'Inspect corn whorls immediately for fresh feeding sign and frass.',
            'Deploy pheromone traps to monitor adult moth populations in the field.',
            'Apply recommended biological agents (e.g., Bacillus thuringiensis / NPV) in young whorls.',
            'Consult local agricultural extension officers for region-approved IPM sprays.'
        ],
        'Medium': [
            'Scout fields twice weekly, specifically targeting young seedling/vegetative whorls.',
            'Encourage natural predators such as parasitoid wasps and ladybird beetles.',
            'Maintain weed-free field borders to minimize alternative hosts.'
        ],
        'Low': [
            'Routine weekly monitoring during early vegetative stages.',
            'Ensure proper crop spacing and balanced soil nitrogen levels.'
        ]
    },
    'Stem Borer': {
        'description': 'Stem Borer larvae tunnel into corn stalks, causing dead heart symptoms and lodging.',
        'High': [
            'Check for dead heart symptoms in vegetative plants and bore holes on stalks.',
            'Remove and destroy heavily infested dead-heart plants to prevent larvae spread.',
            'Consider releasing Trichogramma egg parasitoids in affected blocks.',
            'Seek advice from certified agronomists for targeted stem-borer controls.'
        ],
        'Medium': [
            'Monitor fields for egg masses on the lower surface of corn leaves.',
            'Avoid excessive nitrogen fertilization which encourages soft stalk growth.'
        ],
        'Low': [
            'Practice crop rotation with non-host crops like legumes or oilseeds.',
            'Destruction of stubble after previous harvest to destroy overwintering larvae.'
        ]
    },
    'Corn Earworm': {
        'description': 'Corn Earworm (Helicoverpa zea) targets corn silks and developing kernels at the tip of ears.',
        'High': [
            'Inspect ear tips and silks for feeding larvae and kernel damage.',
            'Apply mineral oil or approved bio-pesticides directly to silks during early silking phase.',
            'Harvest mature ears promptly to avoid late-stage kernel loss.'
        ],
        'Medium': [
            'Monitor moth activity using light or pheromone traps.',
            'Maintain proper field sanitation and clear dropped residues.'
        ],
        'Low': [
            'Plant pest-resistant or well-husked corn varieties when available.',
            'Regular scouting during flowering/tasseling stages.'
        ]
    },
    'Cutworm': {
        'description': 'Cutworm larvae cut young corn seedlings at or just below the soil surface.',
        'High': [
            'Inspect seedling bases early in the morning for severed stems.',
            'Apply moist bran baits or soil-surface bio-defenses around young rows.',
            'Ensure clean cultivation to eliminate cutworm weed shelters.'
        ],
        'Medium': [
            'Check field borders for missing seedling stands or wilting seedlings.',
            'Avoid planting immediately after pasture without thorough soil tillage.'
        ],
        'Low': [
            'Prepare well-tilled soil beds prior to sowing.',
            'Monitor young crop stands during the first 3 weeks post-emergence.'
        ]
    },
    'Aphids': {
        'description': 'Corn leaf aphids suck sap from leaves and tassels, excreting honeydew that induces black soot.',
        'High': [
            'Check whorls and tassels for dense aphid colonies and honeydew accumulation.',
            'Spray strong water streams or insecticidal soaps if tasseling is severely infested.',
            'Protect beneficial insects (ladybugs, lacewings, hoverfly larvae).'
        ],
        'Medium': [
            'Monitor moisture stress, as drought-stressed corn is more susceptible.',
            'Avoid prophylactic broad-spectrum insecticide sprays that kill predators.'
        ],
        'Low': [
            'Maintain healthy soil moisture levels.',
            'Observe tassels during early flowering stage.'
        ]
    },
    'Shoot Fly': {
        'description': 'Shoot Fly maggots attack young corn seedlings causing dead hearts and stunting.',
        'High': [
            'Inspect 1-4 week old seedlings for central leaf drying.',
            'Increase seed rate slightly and rogue out affected seedlings early.',
            'Consult agricultural experts for seed treatment protocols.'
        ],
        'Medium': [
            'Ensure early and uniform sowing at the onset of monsoon/season.',
            'Use intercropping with resistant pulses.'
        ],
        'Low': [
            'Ensure optimal seed planting depth and strong field drainage.'
        ]
    },
    'Corn Rootworm': {
        'description': 'Corn Rootworm larvae feed on corn roots, causing goose-necking and lodging.',
        'High': [
            'Examine root systems of lodged plants for root pruning and tunneling.',
            'Implement mandatory crop rotation with non-grass crops for the next season.',
            'Consult experts regarding soil-applied biological or granular controls.'
        ],
        'Medium': [
            'Monitor adult beetle populations on silks during pollination phase.',
            'Avoid continuous corn-after-corn monoculture.'
        ],
        'Low': [
            'Rotate crops annually and practice autumn plowing.'
        ]
    },
    'White Grub': {
        'description': 'White Grubs feed on corn roots underground, leading to patch drying of the crop.',
        'High': [
            'Examine soil root zone near drying plant patches for C-shaped white grubs.',
            'Expose grubs to predators via shallow summer plowing.',
            'Apply entomopathogenic nematodes (Metarhizium anisopliae) to soil.'
        ],
        'Medium': [
            'Use light traps to capture adult chafer beetles during initial monsoons.',
            'Avoid raw manure application; ensure fully composted organic matter.'
        ],
        'Low': [
            'Deep plowing after harvest to destroy pupae.'
        ]
    },
    'Termites': {
        'description': 'Termites attack crop roots and lower stalks, especially under dry drought conditions.',
        'High': [
            'Inspect wilting plants for hollowed-out lower stalks filled with mud galleries.',
            'Irrigate field promptly as moisture suppresses termite tunneling.',
            'Locate and destroy nearby termite mounds around field margins.'
        ],
        'Medium': [
            'Remove un-decomposed woody debris and dry stalks from field.',
            'Apply neem seed cake to the soil surrounding rows.'
        ],
        'Low': [
            'Ensure adequate soil moisture retention during dry spells.'
        ]
    },
    'Pink Stem Borer': {
        'description': 'Pink Stem Borer (Sesamia inferens) bores into lower stalks during cooler growing seasons.',
        'High': [
            'Look for central whorl leaf perforation and pinkish larvae inside stem bases.',
            'Remove dead hearts and burn stubble after crop harvest.',
            'Seek agronomic guidance on selective bio-pesticide sprays.'
        ],
        'Medium': [
            'Monitor fields in Rabi/winter season for early whorl feeding symptoms.',
            'Promote field sanitation and rogue out alternative weed hosts.'
        ],
        'Low': [
            'Use balanced N-P-K fertilization and certified seeds.'
        ]
    }
}
