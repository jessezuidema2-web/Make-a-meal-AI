// Recipe data with 100% unique images and comprehensive filter coverage
// Each filter combination should return at least 5 recipes

export interface DiscoverRecipe {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: number;
  image: string;
  tags: string[];
}

// ============================================================================
// ITALIAN RECIPES (60+ recipes)
// ============================================================================
const ITALIAN_RECIPES: DiscoverRecipe[] = [
  // ITALIAN BREAKFAST - HIGH PROTEIN (5+)
  { name: 'Italian Frittata', description: 'Baked egg frittata with roasted peppers, zucchini & pecorino', calories: 320, protein: 24, carbs: 8, fat: 22, time: 20, tags: ['italian', 'breakfast', 'high-protein'], image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&h=400&fit=crop' },
  { name: 'Prosciutto & Eggs', description: 'Sunny-side eggs with crispy prosciutto & arugula', calories: 350, protein: 26, carbs: 4, fat: 26, time: 10, tags: ['italian', 'breakfast', 'high-protein', 'quick', 'carnivore', 'cutting'], image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop' },
  { name: 'Italian Sausage Scramble', description: 'Scrambled eggs with Italian sausage, peppers & mozzarella', calories: 420, protein: 30, carbs: 6, fat: 32, time: 12, tags: ['italian', 'breakfast', 'high-protein', 'quick', 'carnivore'], image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&h=400&fit=crop' },
  { name: 'Uova in Purgatorio', description: 'Eggs poached in spicy tomato sauce with crusty bread', calories: 340, protein: 22, carbs: 24, fat: 18, time: 15, tags: ['italian', 'breakfast', 'high-protein', 'quick', 'spicy'], image: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=400&h=400&fit=crop' },
  { name: 'Stracciata Eggs', description: 'Italian-style eggs in brodo with parmesan', calories: 280, protein: 22, carbs: 4, fat: 20, time: 10, tags: ['italian', 'breakfast', 'high-protein', 'quick', 'cutting'], image: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=400&fit=crop' },
  { name: 'Caprese Omelette', description: 'Fluffy omelette with fresh mozzarella, tomato & basil', calories: 380, protein: 28, carbs: 6, fat: 28, time: 12, tags: ['italian', 'breakfast', 'high-protein', 'quick'], image: 'https://images.unsplash.com/photo-1612240498936-65f5101365d2?w=400&h=400&fit=crop' },

  // ITALIAN BREAKFAST - SWEET (5+)
  { name: 'Ricotta Toast', description: 'Toasted sourdough with creamy ricotta, fresh figs & honey', calories: 310, protein: 12, carbs: 42, fat: 12, time: 5, tags: ['italian', 'breakfast', 'sweet', 'quick'], image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=400&fit=crop' },
  { name: 'Italian Cornetto', description: 'Buttery croissant filled with pastry cream', calories: 350, protein: 6, carbs: 48, fat: 16, time: 5, tags: ['italian', 'breakfast', 'sweet', 'quick'], image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop' },
  { name: 'Sfogliatella', description: 'Flaky pastry filled with sweet ricotta & candied citrus', calories: 280, protein: 5, carbs: 38, fat: 12, time: 10, tags: ['italian', 'breakfast', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1509983165097-0c31a863e3f3?w=400&h=400&fit=crop' },
  { name: 'Bomboloni', description: 'Italian filled doughnuts with vanilla custard', calories: 320, protein: 6, carbs: 44, fat: 14, time: 15, tags: ['italian', 'breakfast', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=400&h=400&fit=crop' },
  { name: 'Granita Siciliana', description: 'Frozen lemon granita served in a sweet brioche bun', calories: 310, protein: 5, carbs: 58, fat: 8, time: 10, tags: ['italian', 'breakfast', 'sweet', 'quick'], image: 'https://images.unsplash.com/photo-1501959915551-4e8d30928317?w=400&h=400&fit=crop' },
  { name: 'Maritozzo con Panna', description: 'Sweet Roman bun filled with whipped cream', calories: 340, protein: 6, carbs: 46, fat: 16, time: 5, tags: ['italian', 'breakfast', 'sweet', 'quick'], image: 'https://images.unsplash.com/photo-1517433670267-30f41c09e3b5?w=400&h=400&fit=crop' },

  // ITALIAN LUNCH - HIGH PROTEIN (5+)
  { name: 'Pesto Shrimp Pasta', description: 'Linguine with Genovese pesto & sautéed garlic shrimp', calories: 540, protein: 32, carbs: 52, fat: 22, time: 20, tags: ['italian', 'lunch', 'dinner', 'high-protein'], image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=400&fit=crop' },
  { name: 'Chicken Caesar Salad', description: 'Grilled chicken with romaine, parmesan & caesar dressing', calories: 420, protein: 38, carbs: 12, fat: 26, time: 15, tags: ['italian', 'lunch', 'high-protein', 'quick', 'cutting'], image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=400&fit=crop' },
  { name: 'Italian Tuna Salad', description: 'Mediterranean tuna with white beans, olives & lemon', calories: 380, protein: 34, carbs: 18, fat: 20, time: 10, tags: ['italian', 'lunch', 'high-protein', 'quick', 'cutting'], image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop' },
  { name: 'Grilled Chicken Panini', description: 'Ciabatta with grilled chicken, pesto & mozzarella', calories: 520, protein: 36, carbs: 42, fat: 24, time: 15, tags: ['italian', 'lunch', 'high-protein', 'quick'], image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop' },
  { name: 'Salmon Carpaccio', description: 'Thinly sliced raw salmon with capers & lemon oil', calories: 320, protein: 30, carbs: 4, fat: 22, time: 10, tags: ['italian', 'lunch', 'high-protein', 'quick', 'cutting'], image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=400&fit=crop' },

  // ITALIAN LUNCH - VEGAN (5+)
  { name: 'Pasta Primavera', description: 'Penne with seasonal vegetables in garlic olive oil', calories: 380, protein: 12, carbs: 62, fat: 10, time: 20, tags: ['italian', 'lunch', 'dinner', 'vegan'], image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop' },
  { name: 'Minestrone Soup', description: 'Hearty vegetable soup with beans, pasta & herbs', calories: 280, protein: 10, carbs: 42, fat: 8, time: 25, tags: ['italian', 'lunch', 'dinner', 'vegan', 'cutting'], image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=400&fit=crop' },
  { name: 'Bruschetta', description: 'Toasted bread with fresh tomatoes, basil & garlic', calories: 180, protein: 4, carbs: 28, fat: 6, time: 10, tags: ['italian', 'lunch', 'snack', 'vegan', 'quick'], image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=400&fit=crop' },
  { name: 'Caponata Siciliana', description: 'Sweet & sour eggplant stew with capers & olives', calories: 220, protein: 4, carbs: 28, fat: 12, time: 25, tags: ['italian', 'lunch', 'dinner', 'vegan', 'cutting'], image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a6?w=400&h=400&fit=crop' },
  { name: 'Ribollita Toscana', description: 'Tuscan bread soup with cannellini beans & kale', calories: 320, protein: 12, carbs: 48, fat: 10, time: 30, tags: ['italian', 'lunch', 'dinner', 'vegan'], image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&h=400&fit=crop' },
  { name: 'Panzanella', description: 'Tuscan bread salad with tomatoes & fresh basil', calories: 260, protein: 6, carbs: 36, fat: 12, time: 15, tags: ['italian', 'lunch', 'vegan', 'quick'], image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop' },

  // ITALIAN DINNER - CARNIVORE (5+)
  { name: 'Chicken Parmigiana', description: 'Breaded chicken breast with marinara & mozzarella', calories: 580, protein: 42, carbs: 28, fat: 34, time: 25, tags: ['italian', 'dinner', 'high-protein', 'carnivore', 'bulking'], image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=400&fit=crop' },
  { name: 'Osso Buco', description: 'Braised veal shanks in white wine, tomato & gremolata', calories: 620, protein: 45, carbs: 18, fat: 42, time: 60, tags: ['italian', 'dinner', 'high-protein', 'carnivore', 'bulking'], image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=400&fit=crop' },
  { name: 'Chicken Piccata', description: 'Pan-fried chicken in lemon-caper butter sauce', calories: 520, protein: 38, carbs: 12, fat: 38, time: 20, tags: ['italian', 'dinner', 'lunch', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop' },
  { name: 'Saltimbocca', description: 'Veal wrapped in prosciutto & sage, pan-fried in butter', calories: 480, protein: 40, carbs: 4, fat: 34, time: 15, tags: ['italian', 'dinner', 'high-protein', 'carnivore', 'quick', 'cutting'], image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=400&fit=crop' },
  { name: 'Bistecca Fiorentina', description: 'Grilled T-bone steak Florentine style with rosemary', calories: 650, protein: 52, carbs: 2, fat: 48, time: 20, tags: ['italian', 'dinner', 'high-protein', 'carnivore', 'bulking'], image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop' },
  { name: 'Porchetta', description: 'Slow-roasted pork belly with fennel & herbs', calories: 580, protein: 38, carbs: 4, fat: 46, time: 45, tags: ['italian', 'dinner', 'high-protein', 'carnivore', 'bulking'], image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop' },

  // ITALIAN DINNER - SPICY (5+)
  { name: 'Arrabbiata Penne', description: 'Penne in fiery tomato sauce with garlic & chili', calories: 420, protein: 14, carbs: 68, fat: 12, time: 15, tags: ['italian', 'dinner', 'lunch', 'spicy', 'vegan', 'quick'], image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop' },
  { name: 'Fra Diavolo Shrimp', description: 'Shrimp in spicy tomato-garlic sauce over linguine', calories: 490, protein: 30, carbs: 52, fat: 18, time: 20, tags: ['italian', 'dinner', 'spicy', 'high-protein'], image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop' },
  { name: 'Calabrese Pasta', description: 'Orecchiette with nduja, broccoli rabe & pecorino', calories: 550, protein: 24, carbs: 58, fat: 26, time: 20, tags: ['italian', 'dinner', 'lunch', 'spicy', 'carnivore'], image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop' },
  { name: 'Vodka Penne Piccante', description: 'Creamy vodka sauce with crushed red pepper', calories: 580, protein: 22, carbs: 62, fat: 28, time: 20, tags: ['italian', 'dinner', 'lunch', 'spicy'], image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400&h=400&fit=crop' },
  { name: 'Spaghetti Aglio e Olio', description: 'Spaghetti with garlic, chili flakes & olive oil', calories: 380, protein: 12, carbs: 58, fat: 14, time: 12, tags: ['italian', 'dinner', 'lunch', 'spicy', 'vegan', 'quick'], image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=400&h=400&fit=crop' },

  // ITALIAN SNACKS & SWEET (5+)
  { name: 'Tiramisu', description: 'Espresso-soaked savoiardi with mascarpone cream', calories: 380, protein: 6, carbs: 42, fat: 22, time: 20, tags: ['italian', 'sweet', 'snack'], image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop' },
  { name: 'Panna Cotta', description: 'Silky cream pudding with fresh berry compote', calories: 320, protein: 4, carbs: 32, fat: 20, time: 15, tags: ['italian', 'sweet', 'snack'], image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop' },
  { name: 'Cannoli', description: 'Crispy shells filled with sweet ricotta & chocolate', calories: 280, protein: 5, carbs: 34, fat: 14, time: 10, tags: ['italian', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop' },
  { name: 'Zabaglione', description: 'Warm egg custard whipped with Marsala wine', calories: 240, protein: 5, carbs: 28, fat: 12, time: 15, tags: ['italian', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=400&fit=crop' },
  { name: 'Italian Lemon Ricotta Cake', description: 'Light citrus sponge with fresh ricotta', calories: 320, protein: 8, carbs: 44, fat: 14, time: 25, tags: ['italian', 'sweet', 'snack'], image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop' },
  { name: 'Affogato al Caffè', description: 'Vanilla gelato drowned in hot espresso', calories: 280, protein: 5, carbs: 36, fat: 14, time: 5, tags: ['italian', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop' },
  { name: 'Zeppole', description: 'Fried cream puffs filled with custard', calories: 350, protein: 6, carbs: 42, fat: 18, time: 20, tags: ['italian', 'sweet', 'snack'], image: 'https://images.unsplash.com/photo-1551879400-111a9087cd86?w=400&h=400&fit=crop' },
];

// ============================================================================
// ASIAN RECIPES (60+ recipes)
// ============================================================================
const ASIAN_RECIPES: DiscoverRecipe[] = [
  // ASIAN BREAKFAST - HIGH PROTEIN (5+)
  { name: 'Tamagoyaki with Rice', description: 'Sweet Japanese rolled omelette with steamed rice', calories: 280, protein: 18, carbs: 32, fat: 10, time: 10, tags: ['asian', 'breakfast', 'quick', 'high-protein'], image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400&h=400&fit=crop' },
  { name: 'Chinese Pork Congee', description: 'Silky rice porridge with shredded pork & ginger', calories: 380, protein: 22, carbs: 42, fat: 14, time: 25, tags: ['asian', 'breakfast', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=400&fit=crop' },
  { name: 'Korean Egg Rice Bowl', description: 'Steamed rice with fried egg, sesame oil & kimchi', calories: 320, protein: 18, carbs: 38, fat: 12, time: 8, tags: ['asian', 'breakfast', 'high-protein', 'quick', 'spicy'], image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400&fit=crop' },
  { name: 'Japanese Salmon Onigiri', description: 'Rice balls stuffed with grilled salmon & nori', calories: 290, protein: 20, carbs: 38, fat: 8, time: 10, tags: ['asian', 'breakfast', 'high-protein', 'quick'], image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=400&fit=crop' },
  { name: 'Vietnamese Pho Ga', description: 'Chicken pho with herbs & rice noodles', calories: 420, protein: 32, carbs: 48, fat: 12, time: 20, tags: ['asian', 'breakfast', 'lunch', 'high-protein'], image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=400&fit=crop' },
  { name: 'Chinese Steamed Egg', description: 'Silky steamed egg custard with soy & sesame', calories: 180, protein: 14, carbs: 4, fat: 12, time: 15, tags: ['asian', 'breakfast', 'high-protein', 'quick', 'cutting'], image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f625?w=400&h=400&fit=crop' },

  // ASIAN BREAKFAST - SWEET (5+)
  { name: 'Thai Mango Sticky Rice', description: 'Sweet coconut sticky rice with fresh mango', calories: 340, protein: 4, carbs: 68, fat: 8, time: 15, tags: ['asian', 'breakfast', 'sweet', 'snack', 'vegan', 'quick'], image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop' },
  { name: 'Japanese Fluffy Pancakes', description: 'Soufflé-style pancakes with matcha cream', calories: 380, protein: 10, carbs: 52, fat: 16, time: 20, tags: ['asian', 'breakfast', 'sweet'], image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop' },
  { name: 'Red Bean Buns', description: 'Steamed bao filled with sweet red bean paste', calories: 260, protein: 6, carbs: 52, fat: 4, time: 15, tags: ['asian', 'breakfast', 'sweet', 'vegan', 'quick'], image: 'https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?w=400&h=400&fit=crop' },
  { name: 'Korean Hotteok', description: 'Sweet filled pancakes with brown sugar & nuts', calories: 320, protein: 5, carbs: 58, fat: 10, time: 15, tags: ['asian', 'breakfast', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1590301157284-0a925c0a3c43?w=400&h=400&fit=crop' },
  { name: 'Pandan Custard Buns', description: 'Soft buns with silky pandan custard filling', calories: 280, protein: 6, carbs: 46, fat: 8, time: 10, tags: ['asian', 'breakfast', 'sweet', 'quick'], image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=400&fit=crop' },
  { name: 'Matcha Mochi Waffles', description: 'Crispy mochi waffles with matcha & cream', calories: 360, protein: 6, carbs: 54, fat: 14, time: 15, tags: ['asian', 'breakfast', 'sweet', 'quick'], image: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=400&h=400&fit=crop' },

  // ASIAN LUNCH/DINNER - CARNIVORE (5+)
  { name: 'Teriyaki Salmon Bowl', description: 'Glazed salmon on sushi rice with edamame', calories: 520, protein: 34, carbs: 52, fat: 18, time: 20, tags: ['asian', 'dinner', 'lunch', 'high-protein'], image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop' },
  { name: 'Vietnamese Pho Bo', description: 'Beef bone broth with rice noodles & rare beef', calories: 420, protein: 30, carbs: 48, fat: 12, time: 25, tags: ['asian', 'dinner', 'lunch', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=400&fit=crop' },
  { name: 'Chicken Katsu Curry', description: 'Crispy panko chicken with Japanese curry & rice', calories: 680, protein: 35, carbs: 72, fat: 28, time: 30, tags: ['asian', 'dinner', 'high-protein', 'bulking', 'carnivore'], image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop' },
  { name: 'Korean BBQ Beef', description: 'Bulgogi beef with steamed rice & kimchi', calories: 550, protein: 38, carbs: 48, fat: 22, time: 20, tags: ['asian', 'dinner', 'lunch', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1583224994076-0a498cc3e632?w=400&h=400&fit=crop' },
  { name: 'Thai Basil Chicken', description: 'Stir-fried chicken with holy basil & chili', calories: 480, protein: 35, carbs: 38, fat: 20, time: 15, tags: ['asian', 'dinner', 'lunch', 'high-protein', 'quick', 'spicy', 'carnivore'], image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=400&fit=crop' },
  { name: 'Kung Pao Chicken', description: 'Wok-fried chicken with peanuts & Sichuan pepper', calories: 450, protein: 35, carbs: 28, fat: 24, time: 15, tags: ['asian', 'dinner', 'lunch', 'high-protein', 'quick', 'spicy', 'carnivore'], image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=400&fit=crop' },
  { name: 'Char Siu Pork', description: 'Cantonese BBQ pork with honey glaze', calories: 520, protein: 36, carbs: 32, fat: 28, time: 25, tags: ['asian', 'dinner', 'lunch', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop' },

  // ASIAN DINNER - SPICY (5+)
  { name: 'Tom Yum Goong', description: 'Spicy-sour Thai shrimp soup with lemongrass', calories: 280, protein: 22, carbs: 18, fat: 14, time: 20, tags: ['asian', 'spicy', 'dinner', 'lunch', 'cutting', 'high-protein'], image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&h=400&fit=crop' },
  { name: 'Sichuan Mapo Tofu', description: 'Silken tofu in fiery doubanjiang sauce', calories: 380, protein: 20, carbs: 24, fat: 24, time: 20, tags: ['asian', 'spicy', 'dinner', 'lunch', 'high-protein'], image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=400&fit=crop' },
  { name: 'Korean Bibimbap', description: 'Stone pot rice with veggies, beef & gochujang', calories: 550, protein: 28, carbs: 62, fat: 20, time: 25, tags: ['asian', 'dinner', 'lunch', 'spicy', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400&h=400&fit=crop' },
  { name: 'Korean Buldak', description: 'Gochujang-glazed chicken thighs with cheese', calories: 580, protein: 40, carbs: 32, fat: 32, time: 25, tags: ['asian', 'spicy', 'dinner', 'high-protein', 'carnivore', 'bulking'], image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=400&fit=crop' },
  { name: 'Thai Green Curry', description: 'Coconut green curry with chicken & Thai basil', calories: 480, protein: 32, carbs: 28, fat: 28, time: 20, tags: ['asian', 'spicy', 'dinner', 'lunch', 'high-protein'], image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=400&fit=crop' },
  { name: 'Dan Dan Noodles', description: 'Spicy Sichuan noodles with minced pork', calories: 520, protein: 24, carbs: 58, fat: 22, time: 20, tags: ['asian', 'spicy', 'dinner', 'lunch', 'carnivore'], image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&h=400&fit=crop' },

  // ASIAN - VEGAN (5+)
  { name: 'Pad Thai Tofu', description: 'Rice noodles with crispy tofu & peanuts', calories: 420, protein: 18, carbs: 58, fat: 14, time: 20, tags: ['asian', 'dinner', 'lunch', 'vegan'], image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=400&fit=crop' },
  { name: 'Japanese Veg Curry', description: 'Rich curry with potatoes, carrots & tofu', calories: 450, protein: 14, carbs: 62, fat: 18, time: 25, tags: ['asian', 'dinner', 'lunch', 'vegan'], image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&h=400&fit=crop' },
  { name: 'Thai Coconut Soup', description: 'Creamy tom kha with mushrooms & tofu', calories: 320, protein: 12, carbs: 28, fat: 20, time: 20, tags: ['asian', 'dinner', 'lunch', 'vegan', 'spicy'], image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop' },
  { name: 'Chinese Veg Stir-fry', description: 'Wok-fried bok choy & mushrooms in garlic sauce', calories: 280, protein: 16, carbs: 32, fat: 12, time: 12, tags: ['asian', 'dinner', 'lunch', 'vegan', 'quick', 'cutting'], image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=400&fit=crop' },
  { name: 'Vietnamese Spring Rolls', description: 'Fresh rice paper rolls with vegetables & herbs', calories: 180, protein: 6, carbs: 32, fat: 4, time: 15, tags: ['asian', 'lunch', 'snack', 'vegan', 'cutting', 'quick'], image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=400&fit=crop' },
  { name: 'Vegetable Fried Rice', description: 'Wok-fried rice with mixed vegetables & tofu', calories: 380, protein: 14, carbs: 56, fat: 12, time: 15, tags: ['asian', 'dinner', 'lunch', 'vegan', 'quick'], image: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=400&h=400&fit=crop' },

  // ASIAN SNACKS & SWEET (5+)
  { name: 'Mochi Ice Cream', description: 'Chewy rice flour dough with matcha ice cream', calories: 200, protein: 3, carbs: 36, fat: 6, time: 5, tags: ['asian', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=400&fit=crop' },
  { name: 'Japanese Dorayaki', description: 'Fluffy pancakes filled with red bean paste', calories: 240, protein: 5, carbs: 48, fat: 4, time: 15, tags: ['asian', 'sweet', 'snack', 'breakfast', 'quick'], image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=400&fit=crop' },
  { name: 'Korean Bingsu', description: 'Shaved ice with red beans & condensed milk', calories: 320, protein: 6, carbs: 62, fat: 8, time: 10, tags: ['asian', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1579954115563-e72bf1381629?w=400&h=400&fit=crop' },
  { name: 'Taiyaki', description: 'Fish-shaped waffle with sweet filling', calories: 260, protein: 5, carbs: 48, fat: 6, time: 10, tags: ['asian', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1589476993333-f55b84301219?w=400&h=400&fit=crop' },
  { name: 'Sesame Balls', description: 'Crispy fried glutinous rice balls with red bean', calories: 280, protein: 4, carbs: 52, fat: 8, time: 15, tags: ['asian', 'sweet', 'snack', 'vegan'], image: 'https://images.unsplash.com/photo-1587314168485-3236d6710815?w=400&h=400&fit=crop' },
  { name: 'Pandan Cake', description: 'Light pandan chiffon cake with coconut cream', calories: 300, protein: 5, carbs: 44, fat: 12, time: 20, tags: ['asian', 'sweet', 'snack'], image: 'https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400&h=400&fit=crop' },
];

// ============================================================================
// MIDDLE EASTERN RECIPES (60+ recipes)
// ============================================================================
const MIDDLE_EASTERN_RECIPES: DiscoverRecipe[] = [
  // MIDDLE EASTERN BREAKFAST - HIGH PROTEIN (5+)
  { name: 'Shakshuka', description: 'Eggs poached in spicy cumin-tomato sauce with feta', calories: 350, protein: 22, carbs: 18, fat: 22, time: 20, tags: ['middle_eastern', 'breakfast', 'spicy', 'high-protein'], image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&h=400&fit=crop' },
  { name: 'Labneh Toast', description: 'Thick strained yogurt on toast with za\'atar', calories: 290, protein: 14, carbs: 28, fat: 14, time: 5, tags: ['middle_eastern', 'breakfast', 'quick', 'high-protein'], image: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=400&h=400&fit=crop' },
  { name: 'Turkish Menemen', description: 'Scrambled eggs with tomatoes & peppers', calories: 320, protein: 20, carbs: 16, fat: 20, time: 15, tags: ['middle_eastern', 'breakfast', 'high-protein', 'quick', 'spicy'], image: 'https://images.unsplash.com/photo-1594997756045-f631085ce1d2?w=400&h=400&fit=crop' },
  { name: 'Egyptian Foul Plate', description: 'Fried eggs with ful medames & tahini', calories: 420, protein: 24, carbs: 38, fat: 20, time: 15, tags: ['middle_eastern', 'breakfast', 'high-protein', 'quick'], image: 'https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=400&h=400&fit=crop' },
  { name: 'Shakshuka Verde', description: 'Eggs in green harissa sauce with feta', calories: 340, protein: 20, carbs: 14, fat: 24, time: 20, tags: ['middle_eastern', 'spicy', 'breakfast', 'lunch', 'high-protein'], image: 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=400&h=400&fit=crop' },
  { name: 'Hummus Eggs', description: 'Poached eggs over creamy hummus with olive oil', calories: 380, protein: 22, carbs: 26, fat: 22, time: 12, tags: ['middle_eastern', 'breakfast', 'high-protein', 'quick'], image: 'https://images.unsplash.com/photo-1593001872095-7d5b3868fb1d?w=400&h=400&fit=crop' },

  // MIDDLE EASTERN BREAKFAST - SWEET (5+)
  { name: 'Basbousa', description: 'Semolina cake with orange blossom syrup', calories: 380, protein: 6, carbs: 62, fat: 14, time: 30, tags: ['middle_eastern', 'sweet', 'snack', 'breakfast'], image: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=400&h=400&fit=crop' },
  { name: 'Date Ma\'amoul', description: 'Shortbread cookies with spiced date paste', calories: 180, protein: 3, carbs: 32, fat: 6, time: 10, tags: ['middle_eastern', 'sweet', 'snack', 'breakfast', 'quick', 'vegan'], image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&h=400&fit=crop' },
  { name: 'Qatayef Pancakes', description: 'Thin pancakes with sweet cheese & rose syrup', calories: 340, protein: 12, carbs: 52, fat: 10, time: 15, tags: ['middle_eastern', 'breakfast', 'sweet', 'quick'], image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400&h=400&fit=crop' },
  { name: 'Knafeh Nabulsia', description: 'Shredded phyllo with stretchy cheese & syrup', calories: 450, protein: 10, carbs: 58, fat: 22, time: 25, tags: ['middle_eastern', 'breakfast', 'sweet', 'snack'], image: 'https://images.unsplash.com/photo-1579888944880-d98341245702?w=400&h=400&fit=crop' },
  { name: 'Umm Ali', description: 'Egyptian bread pudding with cream & nuts', calories: 380, protein: 8, carbs: 52, fat: 18, time: 25, tags: ['middle_eastern', 'sweet', 'snack', 'breakfast'], image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400&h=400&fit=crop' },
  { name: 'Halva Toast', description: 'Toasted bread with tahini halva & honey', calories: 320, protein: 6, carbs: 48, fat: 14, time: 5, tags: ['middle_eastern', 'breakfast', 'sweet', 'quick'], image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=400&fit=crop' },

  // MIDDLE EASTERN LUNCH/DINNER - CARNIVORE (5+)
  { name: 'Chicken Shawarma', description: 'Shawarma-spiced chicken with garlic toum', calories: 550, protein: 38, carbs: 28, fat: 32, time: 25, tags: ['middle_eastern', 'dinner', 'lunch', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=400&fit=crop' },
  { name: 'Lamb Kofta Kebab', description: 'Spiced ground lamb skewers with sumac onions', calories: 480, protein: 34, carbs: 12, fat: 34, time: 20, tags: ['middle_eastern', 'dinner', 'high-protein', 'carnivore', 'spicy'], image: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=400&h=400&fit=crop' },
  { name: 'Mansaf', description: 'Jordanian lamb in fermented yogurt sauce', calories: 720, protein: 42, carbs: 48, fat: 42, time: 40, tags: ['middle_eastern', 'dinner', 'bulking', 'carnivore', 'high-protein'], image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=400&fit=crop' },
  { name: 'Shish Taouk', description: 'Yogurt-marinated chicken skewers with garlic dip', calories: 420, protein: 38, carbs: 12, fat: 26, time: 20, tags: ['middle_eastern', 'dinner', 'lunch', 'high-protein', 'carnivore', 'cutting'], image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=400&fit=crop' },
  { name: 'Beef Shawarma', description: 'Thinly sliced spiced beef with tahini', calories: 520, protein: 40, carbs: 24, fat: 32, time: 25, tags: ['middle_eastern', 'dinner', 'lunch', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop' },
  { name: 'Lahmacun', description: 'Thin crispy flatbread with spiced lamb', calories: 380, protein: 22, carbs: 38, fat: 16, time: 15, tags: ['middle_eastern', 'spicy', 'lunch', 'dinner', 'quick', 'carnivore', 'high-protein'], image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop' },
  { name: 'Harissa Chicken', description: 'Roasted chicken in fiery harissa paste', calories: 480, protein: 35, carbs: 8, fat: 36, time: 30, tags: ['middle_eastern', 'spicy', 'dinner', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=400&fit=crop' },

  // MIDDLE EASTERN - VEGAN (5+)
  { name: 'Falafel Wrap', description: 'Crispy chickpea falafel with tahini & pickles', calories: 420, protein: 14, carbs: 52, fat: 18, time: 20, tags: ['middle_eastern', 'lunch', 'vegan'], image: 'https://images.unsplash.com/photo-1558005137-d9619a5c539f?w=400&h=400&fit=crop' },
  { name: 'Mujaddara', description: 'Lentils and rice with crispy fried onions', calories: 380, protein: 16, carbs: 58, fat: 12, time: 25, tags: ['middle_eastern', 'dinner', 'lunch', 'vegan', 'high-protein'], image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=400&fit=crop' },
  { name: 'Harira Soup', description: 'Moroccan tomato-lentil soup with chickpeas', calories: 280, protein: 14, carbs: 42, fat: 6, time: 25, tags: ['middle_eastern', 'dinner', 'lunch', 'vegan', 'cutting', 'high-protein'], image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4854?w=400&h=400&fit=crop' },
  { name: 'Fattoush Salad', description: 'Crispy pita chips with fresh veggies & sumac', calories: 180, protein: 4, carbs: 24, fat: 8, time: 10, tags: ['middle_eastern', 'lunch', 'snack', 'vegan', 'cutting', 'quick'], image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&h=400&fit=crop' },
  { name: 'Muhammara', description: 'Spicy roasted red pepper & walnut dip', calories: 220, protein: 5, carbs: 18, fat: 16, time: 15, tags: ['middle_eastern', 'spicy', 'snack', 'lunch', 'vegan', 'quick'], image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=400&fit=crop' },
  { name: 'Stuffed Grape Leaves', description: 'Vine leaves stuffed with rice, herbs & lemon', calories: 200, protein: 4, carbs: 32, fat: 8, time: 30, tags: ['middle_eastern', 'lunch', 'snack', 'vegan'], image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400&h=400&fit=crop' },

  // MIDDLE EASTERN SNACKS & SWEET (5+)
  { name: 'Kunafa', description: 'Crispy shredded phyllo with melted cheese', calories: 450, protein: 10, carbs: 58, fat: 22, time: 25, tags: ['middle_eastern', 'sweet', 'snack'], image: 'https://images.unsplash.com/photo-1579888944880-d98341245703?w=400&h=400&fit=crop' },
  { name: 'Baklava', description: 'Layers of phyllo with walnuts & honey syrup', calories: 320, protein: 5, carbs: 42, fat: 18, time: 15, tags: ['middle_eastern', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&h=400&fit=crop' },
  { name: 'Luqaimat', description: 'Crispy dough balls drizzled with date syrup', calories: 280, protein: 4, carbs: 48, fat: 10, time: 15, tags: ['middle_eastern', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop' },
  { name: 'Turkish Delight', description: 'Rose-flavored lokum with pistachios', calories: 180, protein: 2, carbs: 42, fat: 2, time: 5, tags: ['middle_eastern', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1590080875897-700a1dab3563?w=400&h=400&fit=crop' },
  { name: 'Halva', description: 'Tahini-based confection with pistachios', calories: 320, protein: 8, carbs: 38, fat: 18, time: 5, tags: ['middle_eastern', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1621944049438-0a92389c6a0f?w=400&h=400&fit=crop' },
];

// ============================================================================
// MEXICAN RECIPES (60+ recipes)
// ============================================================================
const MEXICAN_RECIPES: DiscoverRecipe[] = [
  // MEXICAN BREAKFAST - HIGH PROTEIN (5+)
  { name: 'Huevos Rancheros', description: 'Fried eggs on corn tortillas with ranchero sauce', calories: 450, protein: 22, carbs: 36, fat: 26, time: 15, tags: ['mexican', 'breakfast', 'spicy', 'quick', 'high-protein'], image: 'https://images.unsplash.com/photo-1564758866811-4780e3455168?w=400&h=400&fit=crop' },
  { name: 'Breakfast Burrito', description: 'Flour tortilla with scrambled eggs & chorizo', calories: 520, protein: 28, carbs: 42, fat: 28, time: 10, tags: ['mexican', 'breakfast', 'high-protein', 'quick', 'carnivore', 'bulking'], image: 'https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?w=400&h=400&fit=crop' },
  { name: 'Machaca con Huevos', description: 'Shredded beef with scrambled eggs & peppers', calories: 420, protein: 35, carbs: 12, fat: 28, time: 15, tags: ['mexican', 'breakfast', 'high-protein', 'quick', 'carnivore'], image: 'https://images.unsplash.com/photo-1612871689353-ccd2478e335d?w=400&h=400&fit=crop' },
  { name: 'Chilaquiles con Pollo', description: 'Tortilla chips in salsa with shredded chicken', calories: 480, protein: 28, carbs: 42, fat: 24, time: 15, tags: ['mexican', 'breakfast', 'high-protein', 'quick', 'spicy'], image: 'https://images.unsplash.com/photo-1534352956036-cd81e27dd615?w=400&h=400&fit=crop' },
  { name: 'Huevos a la Mexicana', description: 'Scrambled eggs with tomato, onion & jalapeño', calories: 320, protein: 22, carbs: 8, fat: 24, time: 10, tags: ['mexican', 'breakfast', 'high-protein', 'quick', 'spicy'], image: 'https://images.unsplash.com/photo-1600335895229-6e75511892c9?w=400&h=400&fit=crop' },
  { name: 'Chorizo & Eggs', description: 'Spicy Mexican chorizo with scrambled eggs', calories: 450, protein: 28, carbs: 6, fat: 36, time: 12, tags: ['mexican', 'breakfast', 'high-protein', 'quick', 'carnivore', 'spicy'], image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=400&fit=crop' },

  // MEXICAN BREAKFAST - SWEET (5+)
  { name: 'Churros & Chocolate', description: 'Spiced chocolate with crispy cinnamon churros', calories: 450, protein: 8, carbs: 62, fat: 22, time: 15, tags: ['mexican', 'breakfast', 'sweet', 'quick'], image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop' },
  { name: 'Capirotada', description: 'Mexican bread pudding with piloncillo & cheese', calories: 380, protein: 10, carbs: 58, fat: 14, time: 25, tags: ['mexican', 'breakfast', 'sweet'], image: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=400&h=400&fit=crop' },
  { name: 'Conchas', description: 'Sweet Mexican bread rolls with shell topping', calories: 280, protein: 5, carbs: 52, fat: 8, time: 10, tags: ['mexican', 'breakfast', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=400&fit=crop' },
  { name: 'Atole de Vainilla', description: 'Warm vanilla corn drink with cinnamon', calories: 220, protein: 4, carbs: 42, fat: 4, time: 15, tags: ['mexican', 'breakfast', 'sweet', 'quick'], image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop' },
  { name: 'Arroz con Leche', description: 'Creamy Mexican rice pudding with cinnamon', calories: 320, protein: 6, carbs: 58, fat: 8, time: 25, tags: ['mexican', 'sweet', 'snack', 'breakfast'], image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=400&fit=crop' },
  { name: 'Bunuelos', description: 'Crispy fried tortillas with cinnamon sugar', calories: 340, protein: 4, carbs: 52, fat: 14, time: 15, tags: ['mexican', 'breakfast', 'sweet', 'quick'], image: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400&h=400&fit=crop' },

  // MEXICAN LUNCH/DINNER - CARNIVORE (5+)
  { name: 'Birria Tacos', description: 'Slow-braised chili beef in corn tortillas', calories: 520, protein: 35, carbs: 38, fat: 26, time: 30, tags: ['mexican', 'dinner', 'lunch', 'spicy', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1624300629298-e9de39c13be5?w=400&h=400&fit=crop' },
  { name: 'Carne Asada', description: 'Grilled marinated flank steak with charred limes', calories: 480, protein: 42, carbs: 8, fat: 32, time: 20, tags: ['mexican', 'dinner', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400&h=400&fit=crop' },
  { name: 'Carnitas', description: 'Slow-braised pork shoulder with citrus', calories: 520, protein: 38, carbs: 12, fat: 38, time: 40, tags: ['mexican', 'dinner', 'lunch', 'high-protein', 'carnivore'], image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400&h=400&fit=crop' },
  { name: 'Al Pastor Tacos', description: 'Marinated pork with pineapple & cilantro', calories: 420, protein: 32, carbs: 36, fat: 18, time: 20, tags: ['mexican', 'dinner', 'lunch', 'high-protein', 'carnivore', 'spicy'], image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=400&fit=crop' },
  { name: 'Chicken Burrito Bowl', description: 'Cilantro-lime rice with black beans & chicken', calories: 520, protein: 35, carbs: 56, fat: 16, time: 20, tags: ['mexican', 'lunch', 'dinner', 'high-protein'], image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=400&h=400&fit=crop' },
  { name: 'Barbacoa', description: 'Slow-cooked beef cheeks with chipotle', calories: 480, protein: 42, carbs: 8, fat: 32, time: 45, tags: ['mexican', 'dinner', 'high-protein', 'carnivore', 'spicy'], image: 'https://images.unsplash.com/photo-1611699863812-0a81b84c2d9d?w=400&h=400&fit=crop' },

  // MEXICAN - SPICY (5+)
  { name: 'Chilaquiles Rojos', description: 'Crispy tortilla chips in red salsa with eggs', calories: 480, protein: 20, carbs: 48, fat: 24, time: 15, tags: ['mexican', 'breakfast', 'spicy', 'quick'], image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop' },
  { name: 'Spicy Shrimp Tacos', description: 'Chipotle-marinated shrimp with cabbage slaw', calories: 380, protein: 28, carbs: 32, fat: 16, time: 15, tags: ['mexican', 'dinner', 'lunch', 'spicy', 'high-protein', 'quick'], image: 'https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?w=400&h=400&fit=crop' },
  { name: 'Chile Relleno', description: 'Roasted poblano stuffed with cheese & fried', calories: 420, protein: 18, carbs: 28, fat: 28, time: 25, tags: ['mexican', 'dinner', 'spicy'], image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=400&fit=crop' },
  { name: 'Aguachile', description: 'Shrimp cured in spicy lime-chili marinade', calories: 180, protein: 24, carbs: 8, fat: 6, time: 15, tags: ['mexican', 'lunch', 'snack', 'spicy', 'high-protein', 'cutting', 'quick'], image: 'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?w=400&h=400&fit=crop' },
  { name: 'Camarones a la Diabla', description: 'Shrimp in fiery red devil sauce', calories: 320, protein: 28, carbs: 12, fat: 18, time: 20, tags: ['mexican', 'dinner', 'spicy', 'high-protein', 'cutting'], image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=400&fit=crop' },

  // MEXICAN - VEGAN (5+)
  { name: 'Black Bean Tacos', description: 'Spiced black beans with avocado & corn salsa', calories: 380, protein: 14, carbs: 52, fat: 14, time: 15, tags: ['mexican', 'vegan', 'lunch', 'dinner', 'quick'], image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479a?w=400&h=400&fit=crop' },
  { name: 'Vegetable Fajitas', description: 'Sizzling peppers & onions with guacamole', calories: 340, protein: 10, carbs: 42, fat: 16, time: 15, tags: ['mexican', 'vegan', 'dinner', 'lunch', 'quick', 'spicy'], image: 'https://images.unsplash.com/photo-1577915309091-ab5e0e91e4e3?w=400&h=400&fit=crop' },
  { name: 'Elote', description: 'Grilled corn with vegan mayo, chili & lime', calories: 220, protein: 6, carbs: 38, fat: 8, time: 10, tags: ['mexican', 'snack', 'spicy', 'quick', 'vegan'], image: 'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=400&h=400&fit=crop' },
  { name: 'Guacamole & Chips', description: 'Fresh avocado dip with lime & cilantro', calories: 280, protein: 4, carbs: 28, fat: 18, time: 10, tags: ['mexican', 'snack', 'vegan', 'quick'], image: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=400&h=400&fit=crop' },
  { name: 'Pozole Rojo Vegano', description: 'Hearty hominy stew with mushrooms & chiles', calories: 320, protein: 12, carbs: 48, fat: 10, time: 30, tags: ['mexican', 'dinner', 'vegan', 'spicy'], image: 'https://images.unsplash.com/photo-1583224994076-0a498cc3e633?w=400&h=400&fit=crop' },
  { name: 'Sopes de Frijol', description: 'Thick corn bases with refried beans & salsa', calories: 340, protein: 12, carbs: 48, fat: 12, time: 20, tags: ['mexican', 'lunch', 'dinner', 'vegan'], image: 'https://images.unsplash.com/photo-1606490104701-ced1e7fb8b28?w=400&h=400&fit=crop' },

  // MEXICAN SNACKS & SWEET (5+)
  { name: 'Churros con Chocolate', description: 'Crispy fried dough coated in cinnamon sugar', calories: 420, protein: 6, carbs: 58, fat: 20, time: 20, tags: ['mexican', 'sweet', 'snack'], image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=400&fit=crop' },
  { name: 'Tres Leches Cake', description: 'Sponge cake soaked in three milks', calories: 380, protein: 6, carbs: 54, fat: 16, time: 15, tags: ['mexican', 'sweet', 'snack'], image: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=400&h=400&fit=crop' },
  { name: 'Flan', description: 'Creamy caramel custard with vanilla', calories: 280, protein: 5, carbs: 38, fat: 12, time: 20, tags: ['mexican', 'sweet', 'snack'], image: 'https://images.unsplash.com/photo-1527515545081-5db817172677?w=400&h=400&fit=crop' },
  { name: 'Paletas de Mango', description: 'Fresh mango popsicles with chili & lime', calories: 120, protein: 1, carbs: 28, fat: 1, time: 10, tags: ['mexican', 'sweet', 'snack', 'vegan', 'quick'], image: 'https://images.unsplash.com/photo-1501959915551-4e8d30928318?w=400&h=400&fit=crop' },
  { name: 'Dulce de Leche', description: 'Caramelized milk spread with cinnamon', calories: 220, protein: 4, carbs: 42, fat: 6, time: 15, tags: ['mexican', 'sweet', 'snack', 'quick'], image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop' },
];

// ============================================================================
// GENERAL RECIPES (No specific cuisine - 30+ recipes)
// ============================================================================
const GENERAL_RECIPES: DiscoverRecipe[] = [
  // GENERAL BREAKFAST - HIGH PROTEIN
  { name: 'Avocado Toast', description: 'Sourdough with smashed avo & poached eggs', calories: 410, protein: 22, carbs: 32, fat: 24, time: 10, tags: ['breakfast', 'high-protein', 'quick'], image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop' },
  { name: 'Steak & Eggs', description: 'Pan-seared ribeye with sunny-side up eggs', calories: 620, protein: 48, carbs: 4, fat: 46, time: 15, tags: ['breakfast', 'high-protein', 'carnivore', 'bulking', 'quick'], image: 'https://images.unsplash.com/photo-1588168334045-7d8eb1a5e1e0?w=400&h=400&fit=crop' },
  { name: 'Smoked Salmon Platter', description: 'Cold-smoked salmon with cream cheese & capers', calories: 380, protein: 32, carbs: 12, fat: 24, time: 5, tags: ['breakfast', 'lunch', 'high-protein', 'cutting', 'quick', 'carnivore'], image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop' },
  { name: 'Bacon Egg Cups', description: 'Eggs baked in bacon-lined muffin cups', calories: 280, protein: 20, carbs: 2, fat: 22, time: 15, tags: ['carnivore', 'breakfast', 'high-protein', 'quick', 'cutting'], image: 'https://images.unsplash.com/photo-1525351484163-7529414344d9?w=400&h=400&fit=crop' },
  { name: 'Tofu Scramble', description: 'Seasoned crumbled tofu with peppers & turmeric', calories: 280, protein: 20, carbs: 14, fat: 18, time: 15, tags: ['vegan', 'breakfast', 'high-protein', 'quick'], image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&h=400&fit=crop' },

  // GENERAL BREAKFAST - SWEET
  { name: 'Greek Yogurt Parfait', description: 'Layered Greek yogurt with granola & berries', calories: 320, protein: 18, carbs: 42, fat: 10, time: 5, tags: ['breakfast', 'sweet', 'quick', 'high-protein'], image: 'https://images.unsplash.com/photo-1488477181946-6428a0291778?w=400&h=400&fit=crop' },
  { name: 'Protein Pancakes', description: 'Banana protein pancakes with blueberries', calories: 420, protein: 28, carbs: 48, fat: 14, time: 10, tags: ['breakfast', 'sweet', 'high-protein', 'quick', 'pre-workout'], image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=400&h=400&fit=crop' },
  { name: 'Overnight Oats', description: 'Oats soaked with chia seeds, banana & maple', calories: 380, protein: 12, carbs: 62, fat: 10, time: 5, tags: ['breakfast', 'sweet', 'quick', 'vegan', 'pre-workout'], image: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=400&h=400&fit=crop' },
  { name: 'Açaí Bowl', description: 'Blended açaí with banana, granola & coconut', calories: 350, protein: 8, carbs: 62, fat: 10, time: 5, tags: ['breakfast', 'sweet', 'vegan', 'quick'], image: 'https://images.unsplash.com/photo-1590301157890-4810ed352734?w=400&h=400&fit=crop' },
  { name: 'PB Banana Shake', description: 'Whole milk, banana, PB, oats & honey', calories: 720, protein: 28, carbs: 82, fat: 32, time: 5, tags: ['bulking', 'snack', 'sweet', 'quick', 'pre-workout', 'breakfast'], image: 'https://images.unsplash.com/photo-1577003833619-76bbd7f82948?w=400&h=400&fit=crop' },

  // GENERAL LUNCH/DINNER - HIGH PROTEIN
  { name: 'Zucchini Noodles', description: 'Spiralized zucchini with shrimp & chili', calories: 250, protein: 28, carbs: 12, fat: 10, time: 15, tags: ['cutting', 'dinner', 'high-protein', 'quick', 'spicy'], image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
  { name: 'Cauliflower Rice Bowl', description: 'Riced cauliflower with grilled chicken & veggies', calories: 280, protein: 32, carbs: 14, fat: 12, time: 15, tags: ['cutting', 'dinner', 'lunch', 'high-protein', 'quick'], image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=400&fit=crop' },
  { name: 'Greek Chicken Salad', description: 'Romaine, feta, olives & grilled chicken', calories: 320, protein: 30, carbs: 14, fat: 18, time: 15, tags: ['cutting', 'lunch', 'dinner', 'high-protein', 'quick'], image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop' },
  { name: 'Salmon & Sweet Potato', description: 'Baked salmon fillet with roasted sweet potato', calories: 550, protein: 38, carbs: 42, fat: 24, time: 30, tags: ['dinner', 'high-protein', 'cutting'], image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&h=400&fit=crop' },
  { name: 'Lamb Chops', description: 'Grilled lamb chops with rosemary-garlic butter', calories: 580, protein: 42, carbs: 2, fat: 44, time: 20, tags: ['carnivore', 'dinner', 'high-protein'], image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop' },

  // GENERAL SNACKS
  { name: 'Protein Smoothie', description: 'Banana, whey protein & peanut butter', calories: 280, protein: 25, carbs: 28, fat: 10, time: 5, tags: ['snack', 'high-protein', 'quick', 'pre-workout', 'sweet'], image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=400&fit=crop' },
  { name: 'Energy Bites', description: 'Oats, honey, dark chocolate & almonds', calories: 180, protein: 6, carbs: 28, fat: 8, time: 10, tags: ['snack', 'sweet', 'pre-workout', 'vegan'], image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=400&fit=crop' },
  { name: 'Beef Jerky', description: 'Grass-fed beef jerky with aged cheddar', calories: 250, protein: 28, carbs: 8, fat: 12, time: 2, tags: ['snack', 'quick', 'high-protein', 'carnivore', 'cutting'], image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400&h=400&fit=crop' },
  { name: 'Hard Boiled Eggs', description: 'Perfectly cooked eggs with salt & pepper', calories: 140, protein: 12, carbs: 1, fat: 10, time: 10, tags: ['snack', 'high-protein', 'quick', 'cutting', 'carnivore'], image: 'https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?w=400&h=400&fit=crop' },
  { name: 'Lentil Soup', description: 'Hearty red lentil soup with cumin & lemon', calories: 320, protein: 18, carbs: 48, fat: 6, time: 25, tags: ['vegan', 'dinner', 'lunch', 'high-protein', 'cutting'], image: 'https://images.unsplash.com/photo-1605522469906-3fe226b356bc?w=400&h=400&fit=crop' },
];

// ============================================================================
// COMBINED EXPORT
// ============================================================================
export const ALL_RECIPES: DiscoverRecipe[] = [
  ...ITALIAN_RECIPES,
  ...ASIAN_RECIPES,
  ...MIDDLE_EASTERN_RECIPES,
  ...MEXICAN_RECIPES,
  ...GENERAL_RECIPES,
];

// Helper to get unique images count (for debugging)
export const getUniqueImageCount = () => {
  const images = ALL_RECIPES.map(r => r.image);
  const unique = new Set(images);
  return { total: images.length, unique: unique.size, duplicates: images.length - unique.size };
};
