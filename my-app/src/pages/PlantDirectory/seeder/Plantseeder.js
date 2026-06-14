// ============================================================
// PlantSeeder.js
// Manual seed — no external API needed.
// Run once, then remove the seeder call from PlantDirectory.jsx.
// ============================================================

import {
  collection,
  getCountFromServer,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

const EXISTING_DOC_THRESHOLD = 2;

// ─────────────────────────────────────────────────────────────
// Plant catalog — accurate data, stable Wikipedia image URLs
// Matches your Firestore schema exactly:
// name, scientificName, description, imageUrl, sunlight,
// wateringFrequency, fertilizerFrequency, growthDays,
// pests, diseases, createdAt
// ─────────────────────────────────────────────────────────────
const PLANTS = [

  // ── Herbs ──────────────────────────────────────────────────
  {
    name: 'Basil',
    scientificName: 'Ocimum basilicum',
    description: 'Fragrant culinary herb widely used in Italian and Southeast Asian cooking. Thrives in warm, sunny conditions and produces aromatic leaves all season.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Basil-Basilico-Ocimum_basilicum-albahaca.jpg/1200px-Basil-Basilico-Ocimum_basilicum-albahaca.jpg',
    sunlight: 'direct',
    wateringFrequency: 3,
    fertilizerFrequency: 30,
    growthDays: 60,
    pests: ['aphids', 'spider mites', 'whiteflies'],
    diseases: ['downy mildew', 'fusarium wilt'],
  },
  {
    name: 'Mint',
    scientificName: 'Mentha spicata',
    description: 'Fast-spreading aromatic herb used in cooking and teas. Prefers moist soil and partial shade. Best grown in containers to control its vigorous spreading habit.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Mint-leaves-2007.jpg/1200px-Mint-leaves-2007.jpg',
    sunlight: 'partial',
    wateringFrequency: 3,
    fertilizerFrequency: 30,
    growthDays: 45,
    pests: ['aphids', 'spider mites', 'mint flea beetles'],
    diseases: ['mint rust', 'powdery mildew'],
  },
  {
    name: 'Rosemary',
    scientificName: 'Salvia rosmarinus',
    description: 'Woody Mediterranean herb with needle-like leaves and a pine-like fragrance. Drought-tolerant once established. Ideal for cooking, aromatherapy, and garden borders.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Rosemary_bush.jpg/1200px-Rosemary_bush.jpg',
    sunlight: 'direct',
    wateringFrequency: 10,
    fertilizerFrequency: 60,
    growthDays: 180,
    pests: ['aphids', 'spider mites', 'scale insects'],
    diseases: ['powdery mildew', 'root rot'],
  },
  {
    name: 'Cilantro',
    scientificName: 'Coriandrum sativum',
    description: 'Fast-growing herb with bright, citrusy leaves used in global cuisines. Cool-season plant that bolts quickly in heat. Best sown in successive plantings every few weeks.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Coriander.jpg/1200px-Coriander.jpg',
    sunlight: 'partial',
    wateringFrequency: 4,
    fertilizerFrequency: 30,
    growthDays: 45,
    pests: ['aphids', 'whiteflies'],
    diseases: ['leaf spot', 'damping off'],
  },
  {
    name: 'Lavender',
    scientificName: 'Lavandula angustifolia',
    description: 'Fragrant purple-flowered shrub native to the Mediterranean. Widely used in aromatherapy, cooking, and ornamental gardens. Extremely drought tolerant and bee-friendly.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Bloemen_van_een_lavendelstruikje.jpg/1200px-Bloemen_van_een_lavendelstruikje.jpg',
    sunlight: 'direct',
    wateringFrequency: 14,
    fertilizerFrequency: 60,
    growthDays: 90,
    pests: ['aphids', 'whiteflies', 'caterpillars'],
    diseases: ['root rot', 'leaf spot'],
  },
  {
    name: 'Thyme',
    scientificName: 'Thymus vulgaris',
    description: 'Low-growing Mediterranean herb with tiny aromatic leaves. Excellent for cooking, garden borders, and rock gardens. Very drought tolerant once established.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Thymus_vulgaris_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-267.jpg/800px-Thymus_vulgaris_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-267.jpg',
    sunlight: 'direct',
    wateringFrequency: 10,
    fertilizerFrequency: 60,
    growthDays: 75,
    pests: ['aphids', 'spider mites'],
    diseases: ['root rot', 'botrytis blight'],
  },

  // ── Vegetables ─────────────────────────────────────────────
  {
    name: 'Cherry Tomato',
    scientificName: 'Solanum lycopersicum var. cerasiforme',
    description: 'Prolific small-fruited tomato producing clusters of sweet, bite-sized fruits. Excellent for containers and raised beds. One of the most rewarding vegetables to grow.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Tomato_je.jpg/1200px-Tomato_je.jpg',
    sunlight: 'direct',
    wateringFrequency: 3,
    fertilizerFrequency: 14,
    growthDays: 70,
    pests: ['aphids', 'tomato hornworm', 'whiteflies', 'spider mites'],
    diseases: ['early blight', 'late blight', 'fusarium wilt'],
  },
  {
    name: 'Eggplant',
    scientificName: 'Solanum melongena',
    description: 'Warm-season vegetable producing glossy purple to white fruits. Requires full sun and consistent moisture. Staple ingredient in Asian and Mediterranean cuisines.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Eggplant_Solanum_melongena.jpg/1200px-Eggplant_Solanum_melongena.jpg',
    sunlight: 'direct',
    wateringFrequency: 4,
    fertilizerFrequency: 14,
    growthDays: 80,
    pests: ['flea beetles', 'aphids', 'spider mites', 'Colorado potato beetle'],
    diseases: ['verticillium wilt', 'phomopsis blight'],
  },
  {
    name: 'Bell Pepper',
    scientificName: 'Capsicum annuum',
    description: 'Sweet, mild pepper available in red, green, yellow, and orange. Warm-season crop that needs plenty of sun. High in vitamin C and antioxidants.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Capsicum_annuum_-_Bell_pepper.jpg/1200px-Capsicum_annuum_-_Bell_pepper.jpg',
    sunlight: 'direct',
    wateringFrequency: 4,
    fertilizerFrequency: 14,
    growthDays: 75,
    pests: ['aphids', 'pepper weevils', 'spider mites'],
    diseases: ['bacterial spot', 'anthracnose', 'phytophthora blight'],
  },
  {
    name: 'Lettuce',
    scientificName: 'Lactuca sativa',
    description: 'Fast-growing cool-season leafy green available in dozens of varieties. Ideal for beginners and container gardens. Harvest outer leaves for a continuous supply.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Lactuca_sativa_var_capitata.jpg/1200px-Lactuca_sativa_var_capitata.jpg',
    sunlight: 'partial',
    wateringFrequency: 3,
    fertilizerFrequency: 21,
    growthDays: 45,
    pests: ['aphids', 'slugs', 'caterpillars'],
    diseases: ['downy mildew', 'tip burn', 'bottom rot'],
  },
  {
    name: 'Kangkong',
    scientificName: 'Ipomoea aquatica',
    description: 'Tropical aquatic leafy vegetable popular across Southeast Asia. Fast-growing and highly nutritious. Thrives in moist to waterlogged soil and partial to full sun.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Ipomoea_aquatica_blanco2.388-cropped.jpg/800px-Ipomoea_aquatica_blanco2.388-cropped.jpg',
    sunlight: 'direct',
    wateringFrequency: 2,
    fertilizerFrequency: 21,
    growthDays: 30,
    pests: ['aphids', 'leaf miners'],
    diseases: ['white rust', 'leaf spot'],
  },
  {
    name: 'Bitter Melon',
    scientificName: 'Momordica charantia',
    description: 'Tropical vine producing distinctively bitter fruit used in Asian cuisines and traditional medicine. Highly nutritious and easy to grow in warm, humid climates.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Bitter_melon_on_the_vine.jpg/1200px-Bitter_melon_on_the_vine.jpg',
    sunlight: 'direct',
    wateringFrequency: 3,
    fertilizerFrequency: 21,
    growthDays: 60,
    pests: ['aphids', 'fruit flies', 'cucumber beetles'],
    diseases: ['powdery mildew', 'mosaic virus'],
  },
  {
    name: 'Malunggay',
    scientificName: 'Moringa oleifera',
    description: 'Nutrient-dense tropical tree known as the miracle tree. Leaves, pods, and seeds are all edible and packed with vitamins and minerals. Extremely drought tolerant.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Moringa_oleifera_Blanco1.118.jpg/800px-Moringa_oleifera_Blanco1.118.jpg',
    sunlight: 'direct',
    wateringFrequency: 7,
    fertilizerFrequency: 30,
    growthDays: 90,
    pests: ['aphids', 'caterpillars', 'termites'],
    diseases: ['root rot', 'dieback'],
  },

  // ── Succulents ─────────────────────────────────────────────
  {
    name: 'Aloe Vera',
    scientificName: 'Aloe barbadensis miller',
    description: 'Iconic succulent with thick gel-filled leaves used for centuries for skin healing. Very drought tolerant and nearly impossible to kill with neglect.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Aloe_vera_flower_inset.png/1200px-Aloe_vera_flower_inset.png',
    sunlight: 'direct',
    wateringFrequency: 14,
    fertilizerFrequency: 60,
    growthDays: 365,
    pests: ['mealybugs', 'scale insects', 'aphids'],
    diseases: ['root rot', 'aloe rust', 'bacterial soft rot'],
  },
  {
    name: 'Snake Plant',
    scientificName: 'Dracaena trifasciata',
    description: 'One of the hardiest houseplants available. Tolerates low light and infrequent watering. Excellent air purifier that removes formaldehyde and benzene.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg/800px-Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg',
    sunlight: 'indirect',
    wateringFrequency: 14,
    fertilizerFrequency: 60,
    growthDays: 365,
    pests: ['mealybugs', 'spider mites', 'scale insects'],
    diseases: ['root rot', 'southern blight'],
  },
  {
    name: 'Echeveria',
    scientificName: 'Echeveria elegans',
    description: 'Rosette-forming succulent with powdery blue-green leaves native to Mexican highlands. Popular for arrangements and containers. Very drought tolerant.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Echeveria_2_Edit.jpg/1200px-Echeveria_2_Edit.jpg',
    sunlight: 'direct',
    wateringFrequency: 14,
    fertilizerFrequency: 60,
    growthDays: 180,
    pests: ['mealybugs', 'aphids', 'vine weevils'],
    diseases: ['root rot', 'powdery mildew'],
  },
  {
    name: 'Jade Plant',
    scientificName: 'Crassula ovata',
    description: 'Long-lived succulent shrub with thick oval leaves. Commonly called the money plant and believed to bring good luck. Can live for decades with minimal care.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Crassula_ovata_3.jpg/1200px-Crassula_ovata_3.jpg',
    sunlight: 'direct',
    wateringFrequency: 14,
    fertilizerFrequency: 60,
    growthDays: 730,
    pests: ['mealybugs', 'scale insects', 'spider mites'],
    diseases: ['root rot', 'powdery mildew'],
  },
  {
    name: 'Haworthia',
    scientificName: 'Haworthiopsis attenuata',
    description: 'Small, slow-growing succulent with distinctive white-striped leaves. Tolerates lower light than most succulents. Perfect for desks, windowsills, and small spaces.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Haworthia_attenuata1.jpg/800px-Haworthia_attenuata1.jpg',
    sunlight: 'indirect',
    wateringFrequency: 14,
    fertilizerFrequency: 60,
    growthDays: 365,
    pests: ['mealybugs', 'root mealybugs', 'fungus gnats'],
    diseases: ['root rot'],
  },
  {
    name: 'Barrel Cactus',
    scientificName: 'Ferocactus wislizeni',
    description: 'Iconic cylindrical desert cactus with prominent ribs and strong golden spines. Extremely drought tolerant. Produces yellow to orange flowers in summer.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Ferocactus_wislizeni_1.jpg/800px-Ferocactus_wislizeni_1.jpg',
    sunlight: 'direct',
    wateringFrequency: 21,
    fertilizerFrequency: 90,
    growthDays: 1825,
    pests: ['scale insects', 'mealybugs'],
    diseases: ['root rot', 'bacterial necrosis'],
  },

  // ── Foliage ────────────────────────────────────────────────
  {
    name: 'Monstera',
    scientificName: 'Monstera deliciosa',
    description: 'Tropical aroid with large, dramatically split and perforated leaves. One of the most popular houseplants worldwide. Fast-growing with stunning architectural foliage.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Monstera_deliciosa3.jpg/1200px-Monstera_deliciosa3.jpg',
    sunlight: 'indirect',
    wateringFrequency: 7,
    fertilizerFrequency: 30,
    growthDays: 365,
    pests: ['spider mites', 'scale insects', 'mealybugs', 'thrips'],
    diseases: ['root rot', 'bacterial leaf spot', 'mosaic virus'],
  },
  {
    name: 'Pothos',
    scientificName: 'Epipremnum aureum',
    description: 'Nearly indestructible trailing vine with heart-shaped leaves. Tolerates low light, irregular watering, and neglect better than almost any other plant.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Epipremnum_aureum_31082012.jpg/1200px-Epipremnum_aureum_31082012.jpg',
    sunlight: 'indirect',
    wateringFrequency: 7,
    fertilizerFrequency: 30,
    growthDays: 180,
    pests: ['mealybugs', 'scale insects', 'spider mites'],
    diseases: ['root rot', 'bacterial wilt', 'rhizoctonia root rot'],
  },
  {
    name: 'Peace Lily',
    scientificName: 'Spathiphyllum wallisii',
    description: 'Elegant tropical plant with glossy dark leaves and white spathe flowers. One of the few flowering plants that thrives in low light. Listed by NASA as an air purifier.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Spathiphyllum_cochlearispathum_RTBG.jpg/1200px-Spathiphyllum_cochlearispathum_RTBG.jpg',
    sunlight: 'indirect',
    wateringFrequency: 7,
    fertilizerFrequency: 30,
    growthDays: 365,
    pests: ['mealybugs', 'aphids', 'spider mites', 'scale insects'],
    diseases: ['root rot', 'cylindrocladium root rot', 'leaf blight'],
  },
  {
    name: 'Rubber Plant',
    scientificName: 'Ficus elastica',
    description: 'Bold tropical tree with large glossy burgundy to deep green leaves. Easy to grow indoors and can eventually reach ceiling height. Very architectural and dramatic.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Ficus_elastica_26_03_2012.jpg/1200px-Ficus_elastica_26_03_2012.jpg',
    sunlight: 'indirect',
    wateringFrequency: 7,
    fertilizerFrequency: 30,
    growthDays: 730,
    pests: ['spider mites', 'scale insects', 'mealybugs', 'aphids'],
    diseases: ['root rot', 'anthracnose', 'leaf spot'],
  },
  {
    name: 'ZZ Plant',
    scientificName: 'Zamioculcas zamiifolia',
    description: 'Ultra-low-maintenance tropical plant with waxy, dark green pinnate leaves. Stores water in thick rhizomes making it virtually impossible to kill from neglect.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Zamioculcas_zamiifolia_02.jpg/800px-Zamioculcas_zamiifolia_02.jpg',
    sunlight: 'indirect',
    wateringFrequency: 21,
    fertilizerFrequency: 60,
    growthDays: 365,
    pests: ['mealybugs', 'scale insects', 'aphids'],
    diseases: ['root rot'],
  },
  {
    name: 'Calathea',
    scientificName: 'Calathea ornata',
    description: 'Striking tropical foliage plant with dark green leaves and elegant pink pin-stripe patterns. Leaves fold upward at night in a fascinating daily movement called nyctinasty.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Calathea_ornata1.jpg/800px-Calathea_ornata1.jpg',
    sunlight: 'indirect',
    wateringFrequency: 5,
    fertilizerFrequency: 30,
    growthDays: 365,
    pests: ['spider mites', 'mealybugs', 'scale insects'],
    diseases: ['root rot', 'pseudomonas blight', 'cucumber mosaic virus'],
  },
  {
    name: 'Bird of Paradise',
    scientificName: 'Strelitzia reginae',
    description: 'Spectacular tropical plant producing exotic orange and blue flowers resembling a tropical bird in flight. Makes a dramatic architectural statement indoors or outdoors.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Strelitzia_reginae_protectedplaces.jpg/1200px-Strelitzia_reginae_protectedplaces.jpg',
    sunlight: 'direct',
    wateringFrequency: 7,
    fertilizerFrequency: 30,
    growthDays: 1095,
    pests: ['scale insects', 'mealybugs', 'spider mites'],
    diseases: ['root rot', 'bacterial wilt'],
  },
  {
    name: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    description: 'Dramatic tropical tree with enormous violin-shaped leaves. A design favorite for interior spaces. Requires stable warm conditions and consistent, attentive care.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Ficus_lyrata_1.jpg/800px-Ficus_lyrata_1.jpg',
    sunlight: 'indirect',
    wateringFrequency: 7,
    fertilizerFrequency: 30,
    growthDays: 730,
    pests: ['spider mites', 'scale insects', 'mealybugs', 'aphids'],
    diseases: ['root rot', 'bacterial leaf spot', 'anthracnose'],
  },

  // ── Flowering ──────────────────────────────────────────────
  {
    name: 'Sunflower',
    scientificName: 'Helianthus annuus',
    description: 'Iconic annual flower with large yellow blooms that track the sun. Fast-growing and easy from seed. Produces edible seeds and powerfully attracts pollinators.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/1200px-Sunflower_sky_backdrop.jpg',
    sunlight: 'direct',
    wateringFrequency: 4,
    fertilizerFrequency: 21,
    growthDays: 80,
    pests: ['aphids', 'caterpillars', 'sunflower beetles', 'whiteflies'],
    diseases: ['downy mildew', 'rust', 'botrytis'],
  },
  {
    name: 'Rose',
    scientificName: 'Rosa × hybrida',
    description: 'The classic garden flower available in thousands of varieties and virtually every color. Produces fragrant blooms repeatedly throughout the season with proper care.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Red_Rose_Flower.jpg/1200px-Red_Rose_Flower.jpg',
    sunlight: 'direct',
    wateringFrequency: 4,
    fertilizerFrequency: 14,
    growthDays: 365,
    pests: ['aphids', 'thrips', 'spider mites', 'Japanese beetles', 'scale insects'],
    diseases: ['black spot', 'powdery mildew', 'rust', 'botrytis blight'],
  },
  {
    name: 'Orchid',
    scientificName: 'Phalaenopsis amabilis',
    description: 'The most popular flowering houseplant worldwide. Produces elegant arching sprays of blooms that last for months. Prefers bright indirect light and weekly watering.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Phalaenopsis_JPEG.jpg/1200px-Phalaenopsis_JPEG.jpg',
    sunlight: 'indirect',
    wateringFrequency: 7,
    fertilizerFrequency: 14,
    growthDays: 365,
    pests: ['spider mites', 'mealybugs', 'scale insects', 'thrips'],
    diseases: ['root rot', 'botrytis', 'bacterial brown rot'],
  },
  {
    name: 'Bougainvillea',
    scientificName: 'Bougainvillea spectabilis',
    description: 'Vigorous tropical climbing shrub covered in vibrant papery bracts in magenta, red, orange, or white. Thrives in hot, dry conditions and is spectacular when in full bloom.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bougainvillea_spectabilis_flowers.jpg/1200px-Bougainvillea_spectabilis_flowers.jpg',
    sunlight: 'direct',
    wateringFrequency: 7,
    fertilizerFrequency: 21,
    growthDays: 365,
    pests: ['aphids', 'caterpillars', 'scale insects', 'mealybugs'],
    diseases: ['leaf spot', 'root rot', 'powdery mildew'],
  },
  {
    name: 'Sampaguita',
    scientificName: 'Jasminum sambac',
    description: 'National flower of the Philippines. Small white star-shaped blooms with an intensely sweet fragrance widely used in garlands, perfumes, and teas.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Jasminum_sambac_%28L.%29_Aiton_%28AM_AK291626-1%29.jpg/800px-Jasminum_sambac_%28L.%29_Aiton_%28AM_AK291626-1%29.jpg',
    sunlight: 'direct',
    wateringFrequency: 4,
    fertilizerFrequency: 21,
    growthDays: 180,
    pests: ['aphids', 'scale insects', 'mealybugs', 'spider mites'],
    diseases: ['leaf blight', 'rust', 'root rot'],
  },
  {
    name: 'Hibiscus',
    scientificName: 'Hibiscus rosa-sinensis',
    description: 'Tropical shrub producing large, showy flowers in red, pink, orange, yellow, and white. National flower of Malaysia. Blooms prolifically in warm tropical climates.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hibiscus_rosa-sinensis_in_Kadavoor.jpg/1200px-Hibiscus_rosa-sinensis_in_Kadavoor.jpg',
    sunlight: 'direct',
    wateringFrequency: 4,
    fertilizerFrequency: 14,
    growthDays: 180,
    pests: ['aphids', 'whiteflies', 'thrips', 'spider mites', 'mealybugs'],
    diseases: ['powdery mildew', 'leaf spot', 'root rot'],
  },

  // ── Fruit Trees ────────────────────────────────────────────
  {
    name: 'Mango',
    scientificName: 'Mangifera indica',
    description: 'King of tropical fruits. Large evergreen tree producing sweet, fleshy drupes. Thrives in hot, humid climates. Can be container-grown when young.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Hapus_Mango.jpg/1200px-Hapus_Mango.jpg',
    sunlight: 'direct',
    wateringFrequency: 7,
    fertilizerFrequency: 30,
    growthDays: 1825,
    pests: ['mango hoppers', 'fruit flies', 'scale insects', 'mealybugs'],
    diseases: ['anthracnose', 'powdery mildew', 'bacterial black spot'],
  },
  {
    name: 'Banana',
    scientificName: 'Musa acuminata',
    description: 'Fast-growing tropical giant producing clusters of sweet fruits. Not a true tree but the world\'s largest herbaceous plant. Thrives in humid tropical conditions.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Safou.jpg/1200px-Banana-Safou.jpg',
    sunlight: 'direct',
    wateringFrequency: 4,
    fertilizerFrequency: 21,
    growthDays: 365,
    pests: ['banana weevils', 'spider mites', 'thrips', 'nematodes'],
    diseases: ['Panama disease', 'black sigatoka', 'bunchy top virus'],
  },
  {
    name: 'Calamansi',
    scientificName: 'Citrus × microcarpa',
    description: 'Small citrus tree beloved across Southeast Asia producing tart, fragrant fruits used as condiment, in drinks, and for cleaning. Easy to grow in containers.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Calamansi.jpg/1200px-Calamansi.jpg',
    sunlight: 'direct',
    wateringFrequency: 5,
    fertilizerFrequency: 21,
    growthDays: 730,
    pests: ['citrus leafminer', 'aphids', 'scale insects', 'spider mites'],
    diseases: ['citrus canker', 'greening disease', 'root rot'],
  },
  {
    name: 'Papaya',
    scientificName: 'Carica papaya',
    description: 'Fast-growing tropical fruit tree producing large, sweet orange-fleshed melons. Begins fruiting within a year of planting. Rich in enzymes, vitamin A and vitamin C.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Carica_papaya_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-029.jpg/800px-Carica_papaya_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-029.jpg',
    sunlight: 'direct',
    wateringFrequency: 4,
    fertilizerFrequency: 21,
    growthDays: 270,
    pests: ['papaya fruit fly', 'mealybugs', 'spider mites', 'whiteflies'],
    diseases: ['papaya ringspot virus', 'anthracnose', 'phytophthora root rot'],
  },
  {
    name: 'Guava',
    scientificName: 'Psidium guajava',
    description: 'Productive tropical fruit tree with fragrant fruits rich in vitamin C. Very adaptable and easy to grow. Fruit ranges from white to pink-fleshed varieties.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Guava_ID.jpg/1200px-Guava_ID.jpg',
    sunlight: 'direct',
    wateringFrequency: 5,
    fertilizerFrequency: 30,
    growthDays: 730,
    pests: ['fruit flies', 'scale insects', 'mealybugs', 'guava moth'],
    diseases: ['anthracnose', 'fruit canker', 'wilt disease'],
  },
];


// ─────────────────────────────────────────────────────────────
// Main seeder export
// ─────────────────────────────────────────────────────────────

/**
 * Seed the `plants` Firestore collection from the local catalog.
 * Skips automatically when count > EXISTING_DOC_THRESHOLD.
 *
 * @param {object}   options
 * @param {boolean}  [options.force=false]   – bypass the count guard
 * @param {Function} [options.onProgress]    – callback(imported, total)
 * @returns {Promise<{ skipped: boolean, imported: number }>}
 */
export async function seedPlantsFromApi({ force = false, onProgress } = {}) {

  // ── Guard: skip if already seeded ────────────────────────
  if (!force) {
    const countSnap    = await getCountFromServer(collection(db, 'plants'));
    const currentCount = countSnap.data().count;

    console.log(`[PlantSeeder] Current count: ${currentCount} | Threshold: ${EXISTING_DOC_THRESHOLD}`);

    if (currentCount > EXISTING_DOC_THRESHOLD) {
      console.log(`[PlantSeeder] Already seeded (${currentCount} docs). Skipping.`);
      return { skipped: true, imported: 0 };
    }

    console.log(`[PlantSeeder] Within threshold — seeding ${PLANTS.length} plants...`);
  }

  // ── Write to Firestore ────────────────────────────────────
  let importedCount = 0;

  for (const plant of PLANTS) {
    await addDoc(collection(db, 'plants'), {
      ...plant,
      createdAt: Timestamp.now(),
    });

    importedCount++;
    onProgress?.(importedCount, PLANTS.length);

    if (importedCount % 10 === 0) {
      console.log(`[PlantSeeder] Progress: ${importedCount}/${PLANTS.length}`);
    }
  }

  console.log(`[PlantSeeder] Done. ${importedCount} plants added to Firestore.`);
  return { skipped: false, imported: importedCount };
}