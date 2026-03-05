import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function getCurrentMonthYear() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Generate a random IP address
function randomIP() {
  return `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Generate a random device fingerprint
function randomFingerprint() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Generate N ratings around a target average with natural variance
function generateRatings(targetAvg, count) {
  const ratings = [];
  for (let i = 0; i < count; i++) {
    let r = targetAvg + (Math.random() - 0.5) * 2.5;
    r = Math.max(0.5, Math.min(5.0, Math.round(r * 2) / 2));
    ratings.push(r);
  }
  return ratings;
}

// Reviewer pool — realistic demographics
// 30% 2025, 30% 2026, 25% 2027, 10% 2028, 5% Faculty/Staff
// 45% Male, 45% Female, 10% Prefer not to say
const REVIEWERS = [
  { email: 'jsmith25@blair.edu', grad: '2025', gender: 'Male' },
  { email: 'agarcia25@blair.edu', grad: '2025', gender: 'Female' },
  { email: 'twong25@blair.edu', grad: '2025', gender: 'Male' },
  { email: 'kpatel25@blair.edu', grad: '2025', gender: 'Female' },
  { email: 'rjohnson25@blair.edu', grad: '2025', gender: 'Male' },
  { email: 'lmartinez25@blair.edu', grad: '2025', gender: 'Female' },
  { email: 'dkim25@blair.edu', grad: '2025', gender: 'Prefer not to say' },
  { email: 'mlee25@blair.edu', grad: '2025', gender: 'Male' },
  { email: 'nbrown25@blair.edu', grad: '2025', gender: 'Female' },
  { email: 'cpatel25@blair.edu', grad: '2025', gender: 'Male' },
  { email: 'echen25@blair.edu', grad: '2025', gender: 'Female' },
  { email: 'jpark25@blair.edu', grad: '2025', gender: 'Male' },
  { email: 'mchen26@blair.edu', grad: '2026', gender: 'Female' },
  { email: 'bwilson26@blair.edu', grad: '2026', gender: 'Male' },
  { email: 'sthomas26@blair.edu', grad: '2026', gender: 'Female' },
  { email: 'jtaylor26@blair.edu', grad: '2026', gender: 'Male' },
  { email: 'arivera26@blair.edu', grad: '2026', gender: 'Female' },
  { email: 'kwilliams26@blair.edu', grad: '2026', gender: 'Male' },
  { email: 'hlee26@blair.edu', grad: '2026', gender: 'Prefer not to say' },
  { email: 'rchen26@blair.edu', grad: '2026', gender: 'Female' },
  { email: 'dpark26@blair.edu', grad: '2026', gender: 'Male' },
  { email: 'janderson26@blair.edu', grad: '2026', gender: 'Female' },
  { email: 'mwang26@blair.edu', grad: '2026', gender: 'Male' },
  { email: 'ljones26@blair.edu', grad: '2026', gender: 'Female' },
  { email: 'okim27@blair.edu', grad: '2027', gender: 'Male' },
  { email: 'swhite27@blair.edu', grad: '2027', gender: 'Female' },
  { email: 'jharris27@blair.edu', grad: '2027', gender: 'Male' },
  { email: 'amiller27@blair.edu', grad: '2027', gender: 'Female' },
  { email: 'tclark27@blair.edu', grad: '2027', gender: 'Male' },
  { email: 'nzhang27@blair.edu', grad: '2027', gender: 'Female' },
  { email: 'rdavis27@blair.edu', grad: '2027', gender: 'Male' },
  { email: 'pgupta27@blair.edu', grad: '2027', gender: 'Prefer not to say' },
  { email: 'kmoore27@blair.edu', grad: '2027', gender: 'Female' },
  { email: 'wlee27@blair.edu', grad: '2027', gender: 'Male' },
  { email: 'cjackson28@blair.edu', grad: '2028', gender: 'Female' },
  { email: 'trovinson28@blair.edu', grad: '2028', gender: 'Male' },
  { email: 'lnguyen28@blair.edu', grad: '2028', gender: 'Female' },
  { email: 'bsingh28@blair.edu', grad: '2028', gender: 'Male' },
  { email: 'faculty.thompson@blair.edu', grad: 'Faculty/Staff', gender: 'Male' },
  { email: 'faculty.ramirez@blair.edu', grad: 'Faculty/Staff', gender: 'Female' },
];

// Pick N random unique reviewers
function pickReviewers(n) {
  const shuffled = [...REVIEWERS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// Reviews mapped to food item names
const ITEM_REVIEWS = {
  'Grilled Chicken Breast': [
    'The grilled chicken was actually really good this month, way better seasoned than usual. Would love to see it more often.',
    'Solid option. A bit dry on the edges but the herbs really come through. Pairs well with the roasted veggies.',
    'This is consistently one of the best things in the dining hall. Never disappoints.',
    'It was fine, nothing special. The portion felt smaller than last time.',
  ],
  'Pasta Bolognese': [
    'The bolognese sauce is always a hit. Thick, meaty, and actually tastes homemade.',
    'Pasta was slightly overcooked but the sauce saved it. More parmesan on the side would be nice.',
    'Honestly one of my favorite meals in the dining hall. The sauce made it.',
    'Pretty standard cafeteria pasta. Not bad but not exciting either.',
    'Love this one. Reminds me of home cooking. Please keep it in the rotation.',
  ],
  'BBQ Pulled Pork Sandwich': [
    'The BBQ sauce is really good and the pork is tender. The coleslaw adds a nice crunch too.',
    'Way too much sauce this time, couldn\'t taste the actual pork. Bun got soggy.',
    'One of the better sandwiches they make. I always grab seconds when this is on the menu.',
  ],
  'Caesar Salad with Grilled Salmon': [
    'The salmon was perfectly cooked. Best protein option in the dining hall right now.',
    'Salad was fresh and the dressing was spot on. Could use more croutons though.',
    'I\'m not a huge salad person but this one is legit. The salmon makes it worth it.',
    'Salmon was a bit cold when I got it. Otherwise fine.',
  ],
  'Beef Burger with Fries': [
    'Classic dining hall burger. Nothing gourmet but it hits the spot after practice.',
    'Fries were crispy which is rare. Burger patty could use more seasoning though.',
    'Always a safe choice. Wish they had more topping options like jalapeños or avocado.',
    'Burgers are always decent here. The bun was actually really fresh today.',
    'The fries were kind of soggy this time. Burger was fine though.',
  ],
  'Chicken Parmesan': [
    'Chicken parm is always fire. The breading was extra crispy this time and the mozzarella was melted perfectly.',
    'Good but the spaghetti underneath was way too plain. Needs more sauce.',
    'This is literally the best meal they serve. I plan my schedule around chicken parm days.',
    'Decent but the chicken cutlet was thin. Would prefer a thicker piece.',
  ],
  'Fish and Chips': [
    'The batter was light and crispy, not greasy at all. Way better than expected for a dining hall.',
    'Fish was good but could have used more lemon. Fries were thick cut and perfect.',
    'Not my thing personally but it looked and smelled really good. Tried a bite of my friend\'s and it was solid.',
  ],
  'Vegetable Stir Fry with Tofu': [
    'Love that there\'s a solid vegetarian option. The tofu was actually crispy for once!',
    'The ginger sauce is so good. Wish the vegetables were a bit less mushy though.',
    'Best veg option in the dining hall. The tofu is always well seasoned.',
    'As a vegetarian, I really appreciate this being on the menu. Great flavors.',
    'The sauce was too salty this time. Usually it\'s really good though.',
  ],
  'Mac and Cheese': [
    'The breadcrumb crust on top is everything. So much better than the boxed stuff.',
    'Always cheesy and comforting. Could eat this every day honestly.',
    'It\'s mac and cheese, hard to mess up. This version is better than most.',
    'A little heavy but that\'s kind of the point. Would love a spicy version sometime.',
  ],
  'Grilled Steak Tips': [
    'The steak tips were tender and the mashed potatoes were creamy. Best dinner this month.',
    'Great when they get the cook right. Mine were a bit overcooked but still tasty.',
    'This felt like a special occasion meal. Really impressed with the quality.',
    'Steak tips are always a highlight. The gravy ties everything together.',
  ],
  'Turkey Club Wrap': [
    'Quick and easy lunch option. The wrap was fresh and the ranch wasn\'t overwhelming.',
    'Pretty basic but it works. Good amount of turkey in there.',
    'Solid wrap. Nothing to complain about, nothing to rave about. Just reliable.',
  ],
  'Meatball Sub': [
    'The meatballs were huge and flavorful. Provolone was perfectly melted.',
    'Love the marinara on this. Bread was toasted just right too.',
    'Messy to eat but totally worth it. One of the better sandwich options.',
    'Sub was good but could use more meatballs. Felt like mostly bread.',
  ],
  'Chicken Tikka Masala': [
    'The curry sauce is rich and creamy. Paired with the naan it\'s an amazing meal.',
    'Spice level was perfect — flavorful but not too hot. Rice was fluffy too.',
    'I look forward to this every time it\'s on the menu. Authentic flavors.',
    'Really good but the chicken pieces were a bit small. More naan would be appreciated.',
    'As someone from an Indian family, this is surprisingly good for a dining hall. Well done.',
  ],
  'Beef Tacos': [
    'Tacos are always a crowd pleaser. The salsa is fresh and the seasoning on the beef is great.',
    'Shells were a bit stale but the fillings were on point. Love the sour cream.',
    'These are fine but nothing like real tacos. Serviceable for a quick meal.',
    'Always grab these on taco day. Simple but satisfying.',
  ],
  'Pad Thai': [
    'Love the pad thai! The peanuts and bean sprouts add great texture.',
    'Noodles were cooked well and the tamarind sauce was tangy and sweet. Great dish.',
    'A bit too sweet for my taste but I know a lot of people love it.',
  ],
  'Japanese Teriyaki Bowl': [
    'Teriyaki chicken was juicy and the rice was perfectly sticky. Great bowl.',
    'The edamame and pickled ginger on the side make this feel authentic. Really enjoy it.',
    'Solid option but the teriyaki sauce could be a bit thicker. Still tasty though.',
    'One of the better global flavors items. I get this almost every time it\'s available.',
  ],
  'Mediterranean Falafel Plate': [
    'The falafel was crispy on the outside and soft inside. Hummus was smooth too.',
    'Love this plate. The tabbouleh is fresh and the pita is warm. Full meal.',
    'Good option for anyone wanting something lighter. Really well balanced.',
    'Falafel was a little crumbly but the flavors were good. More tahini please!',
  ],
  'Korean Bibimbap': [
    'This is so underrated. The gochujang sauce brings everything together.',
    'Mixed rice bowls are always good but the Korean seasoning makes this one special.',
    'The fried egg on top was runny and perfect. More of this please.',
  ],
  'Chicken Quesadilla': [
    'Simple and delicious. The cheese was melted perfectly and the chicken was well seasoned.',
    'Great late night snack option. Always consistent.',
    'Could use more peppers and onions but the quesadilla itself is solid.',
    'One of those things that\'s hard to mess up and they do it well.',
  ],
  'Vegetable Curry': [
    'The coconut milk makes this curry so creamy. Chickpeas and sweet potatoes are a great combo.',
    'Perfect comfort food on a cold day. The jasmine rice soaks up the sauce perfectly.',
    'Really flavorful for a vegetarian dish. Even my meat-eating friends liked it.',
  ],
  'Pork Fried Rice': [
    'Fried rice is always a winner. The pork pieces were generous this time.',
    'Tasted like takeout fried rice which is definitely a compliment.',
    'Good wok flavor. The scrambled eggs and scallions add nice color and taste.',
    'Solid but I wish they added more vegetables. Felt a bit carb-heavy.',
  ],
  'Greek Gyro Wrap': [
    'The tzatziki sauce is incredible. Lamb and beef combo is flavorful and tender.',
    'Feels like real street food. The warm pita is a nice touch.',
    'One of the global flavors items I always look forward to. Never disappoints.',
  ],
  'Chicken Burrito Bowl': [
    'Basically Chipotle but free. The guacamole is actually pretty good.',
    'Love the cilantro-lime rice. Everything in this bowl works together well.',
    'My go-to meal whenever it\'s available. The black beans and corn salsa are great.',
    'Good but the chicken was a bit dry today. Usually it\'s better.',
    'Portions are generous and the flavor is on point. Best bowl option.',
  ],
  'Pho (Vietnamese Soup)': [
    'The broth has so much depth of flavor. This is the best soup the dining hall serves by far.',
    'Love having pho as an option. The fresh herbs on the side really make it.',
    'Broth could simmer longer but for a dining hall, this is impressive.',
    'Warm, comforting, and filling. Perfect for winter.',
  ],
  'Chocolate Lava Cake': [
    'The molten center is heavenly. Best dessert they make, period.',
    'Paired with the vanilla ice cream this is an actual restaurant-quality dessert.',
    'Always my first choice when it\'s available. The chocolate is rich and gooey.',
    'A little too sweet for me but the texture is incredible.',
  ],
  'New York Cheesecake': [
    'Creamy and rich. The strawberry topping is a nice touch.',
    'Classic cheesecake that never disappoints. Graham cracker crust is perfect.',
    'Would eat this every day if I could. Top tier dining hall dessert.',
  ],
  'Fresh Fruit Tart': [
    'Beautiful presentation and the custard is smooth. Feels fancy for a dining hall.',
    'Light and refreshing compared to the heavier desserts. Love the glazed fruits.',
    'Pastry was buttery and the fruit was actually fresh. Impressed.',
  ],
  'Chocolate Chip Cookies': [
    'Fresh from the oven these are unbeatable. Warm, gooey, perfect.',
    'The cookies are always solid. Grab a couple with milk and you\'re set.',
    'These go fast for a reason. Probably the most popular dessert overall.',
    'Good cookies but sometimes they\'re overbaked. When they\'re fresh though, 10/10.',
    'I take like 4 of these every time. Cannot stop.',
  ],
  'Tiramisu': [
    'Espresso flavor is strong and the mascarpone is light. Really well made.',
    'Sophisticated dessert for a dining hall. Love the cocoa dusting on top.',
    'Not as good as my grandma\'s but pretty close. Appreciate the effort.',
  ],
  'Apple Pie': [
    'Warm apple pie with that flaky crust hits different. Great comfort dessert.',
    'The cinnamon filling is perfect. Tastes homemade.',
    'Classic and reliable. Could use a scoop of ice cream on top.',
    'My favorite fall dessert. The spiced filling is just right.',
  ],
  'Brownies': [
    'Fudgy and dense, just how brownies should be. The crackly top is chef\'s kiss.',
    'Best brownies I\'ve had in a school setting. Real cocoa makes a difference.',
    'Always grab one after lunch. Consistent quality every time.',
  ],
  'Vanilla Bean Ice Cream': [
    'You can see the actual vanilla bean specks. So much better than generic vanilla.',
    'Creamy and not too sweet. Great on its own or with other desserts.',
    'The waffle cone option is a nice touch. Feels like a real ice cream shop.',
    'Simple but done right. This is quality ice cream.',
  ],
  'Crème Brûlée': [
    'The caramelized sugar crust cracking is so satisfying. Custard is silky smooth.',
    'Didn\'t expect something this fancy in the dining hall. Really impressive.',
    'Rich and elegant. Perfect portion size too.',
  ],
  'Banana Pudding': [
    'Southern comfort in a cup. The vanilla wafers get perfectly soft.',
    'Whipped cream on top is fluffy and the banana flavor is natural, not artificial.',
    'Love this classic dessert. Takes me back to family dinners.',
  ],
  'Red Velvet Cupcake': [
    'Moist cake and the cream cheese frosting is tangy and sweet. Great combo.',
    'Beautiful red color and the crumbs on top are a nice touch.',
    'One of the prettier desserts and it tastes as good as it looks.',
    'Frosting was a bit too thick for me but the cake itself was perfect.',
  ],
  'Churros with Chocolate Sauce': [
    'Crispy, cinnamon-sugary, and that chocolate dipping sauce is addictive.',
    'These churros are legit. Crispy outside, soft inside. The chocolate is rich.',
    'Fun dessert that everyone loves. Always a long line for these.',
    'Wish they served these more often. Best grab-and-go dessert option.',
  ],
};

// Target average ratings per item (some notably low, some near-perfect)
const TARGET_RATINGS = {
  'Grilled Chicken Breast': 4.2,
  'Pasta Bolognese': 4.4,
  'BBQ Pulled Pork Sandwich': 3.8,
  'Caesar Salad with Grilled Salmon': 4.1,
  'Beef Burger with Fries': 3.6,
  'Chicken Parmesan': 4.7,       // near-perfect
  'Fish and Chips': 3.4,
  'Vegetable Stir Fry with Tofu': 3.9,
  'Mac and Cheese': 4.5,
  'Grilled Steak Tips': 4.8,      // near-perfect
  'Turkey Club Wrap': 2.5,        // notably low
  'Meatball Sub': 3.7,
  'Chicken Tikka Masala': 4.6,
  'Beef Tacos': 3.9,
  'Pad Thai': 4.0,
  'Japanese Teriyaki Bowl': 4.3,
  'Mediterranean Falafel Plate': 3.5,
  'Korean Bibimbap': 4.4,
  'Chicken Quesadilla': 3.8,
  'Vegetable Curry': 4.1,
  'Pork Fried Rice': 3.7,
  'Greek Gyro Wrap': 4.0,
  'Chicken Burrito Bowl': 4.5,
  'Pho (Vietnamese Soup)': 4.6,
  'Chocolate Lava Cake': 4.9,     // near-perfect
  'New York Cheesecake': 4.3,
  'Fresh Fruit Tart': 3.8,
  'Chocolate Chip Cookies': 4.5,
  'Tiramisu': 4.2,
  'Apple Pie': 4.0,
  'Brownies': 4.4,
  'Vanilla Bean Ice Cream': 4.1,
  'Crème Brûlée': 3.9,
  'Banana Pudding': 2.3,          // notably low
  'Red Velvet Cupcake': 3.6,
  'Churros with Chocolate Sauce': 4.7,  // near-perfect
};

async function seed() {
  console.log('Seeding database with demo data...\n');
  const monthYear = getCurrentMonthYear();

  // ========== 0. CLEAR EXISTING DATA ==========
  console.log('--- Clearing existing data ---');
  const tablesToClear = [
    'ai_summaries',
    'recommendations',
    'suggestion_votes',
    'suggestion_cards',
    'written_reviews',
    'star_ratings',
    'monthly_cycles',
    'food_items',
    'admin_users',
  ];
  for (const table of tablesToClear) {
    const { error } = await supabase.from(table).delete().not('id', 'is', null);
    if (error) console.error(`  Error clearing ${table}: ${error.message}`);
    else console.log(`  Cleared ${table}`);
  }

  // ========== 1. ACCOUNTS ==========
  console.log('--- Creating accounts ---');
  const accounts = [
    { username: 'admin1', password: 'BlairAdmin1', role: 'admin' },
    { username: 'admin2', password: 'BlairAdmin2', role: 'admin' },
    { username: 'admin3', password: 'BlairAdmin3', role: 'admin' },
    { username: 'staff1', password: 'BlairStaff1', role: 'staff' },
    { username: 'staff2', password: 'BlairStaff2', role: 'staff' },
    { username: 'staff3', password: 'BlairStaff3', role: 'staff' },
  ];

  for (const acct of accounts) {
    const password_hash = await bcrypt.hash(acct.password, 12);
    const { error } = await supabase
      .from('admin_users')
      .upsert({ username: acct.username, password_hash, role: acct.role }, { onConflict: 'username' });
    if (error) console.error(`  Error: ${acct.username}: ${error.message}`);
    else console.log(`  [${acct.role}] ${acct.username}`);
  }

  // ========== 2. FOOD ITEMS + MONTHLY CYCLES ==========
  console.log('\n--- Creating food items ---');
  const foodItems = {
    hot_mains: [
      { name: 'Grilled Chicken Breast', description: 'Juicy grilled chicken breast seasoned with herbs and served with a side of roasted vegetables.', image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop&auto=format' },
      { name: 'Pasta Bolognese', description: 'Classic Italian meat sauce over al dente penne pasta, topped with parmesan cheese.', image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop&auto=format' },
      { name: 'BBQ Pulled Pork Sandwich', description: 'Slow-smoked pulled pork with tangy BBQ sauce on a brioche bun with coleslaw.', image_url: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop&auto=format' },
      { name: 'Caesar Salad with Grilled Salmon', description: 'Crisp romaine lettuce with classic Caesar dressing, croutons, and a grilled salmon fillet.', image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop&auto=format' },
      { name: 'Beef Burger with Fries', description: 'Quarter-pound beef patty with lettuce, tomato, and cheese on a sesame bun with crispy fries.', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format' },
      { name: 'Chicken Parmesan', description: 'Breaded chicken cutlet topped with marinara sauce and melted mozzarella, served with spaghetti.', image_url: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop&auto=format' },
      { name: 'Fish and Chips', description: 'Beer-battered cod fillets with thick-cut fries, tartar sauce, and a lemon wedge.', image_url: 'https://images.unsplash.com/photo-1579208030886-b1f5b7f16100?w=400&h=300&fit=crop&auto=format' },
      { name: 'Vegetable Stir Fry with Tofu', description: 'Fresh mixed vegetables and crispy tofu in a savory soy-ginger sauce over steamed rice.', image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&auto=format' },
      { name: 'Mac and Cheese', description: 'Creamy three-cheese macaroni baked with a golden breadcrumb crust.', image_url: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=400&h=300&fit=crop&auto=format' },
      { name: 'Grilled Steak Tips', description: 'Marinated sirloin steak tips grilled to perfection, served with mashed potatoes and gravy.', image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop&auto=format' },
      { name: 'Turkey Club Wrap', description: 'Sliced turkey, bacon, lettuce, tomato, and ranch dressing in a flour tortilla.', image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop&auto=format' },
      { name: 'Meatball Sub', description: 'Hearty beef meatballs in marinara sauce with melted provolone on a toasted hoagie roll.', image_url: 'https://images.unsplash.com/photo-1578927071640-883c0e100fba?w=400&h=300&fit=crop&auto=format' },
    ],
    global_flavors: [
      { name: 'Chicken Tikka Masala', description: 'Tender chicken pieces in a rich, creamy tomato-based curry sauce served with basmati rice and naan.', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop&auto=format' },
      { name: 'Beef Tacos', description: 'Seasoned ground beef in crispy corn tortillas with fresh salsa, sour cream, and shredded cheese.', image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop&auto=format' },
      { name: 'Pad Thai', description: 'Classic Thai stir-fried rice noodles with shrimp, peanuts, bean sprouts, and tamarind sauce.', image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=300&fit=crop&auto=format' },
      { name: 'Japanese Teriyaki Bowl', description: 'Grilled teriyaki chicken over sushi rice with steamed edamame, pickled ginger, and sesame seeds.', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format' },
      { name: 'Mediterranean Falafel Plate', description: 'Crispy falafel with hummus, tabbouleh, pickled turnips, and warm pita bread.', image_url: 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=400&h=300&fit=crop&auto=format' },
      { name: 'Korean Bibimbap', description: 'Mixed rice bowl with sauteed vegetables, beef, a fried egg, and spicy gochujang sauce.', image_url: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400&h=300&fit=crop&auto=format' },
      { name: 'Chicken Quesadilla', description: 'Grilled flour tortilla filled with seasoned chicken, peppers, onions, and melted cheese.', image_url: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&h=300&fit=crop&auto=format' },
      { name: 'Vegetable Curry', description: 'A fragrant coconut milk curry loaded with chickpeas, sweet potatoes, and spinach over jasmine rice.', image_url: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop&auto=format' },
      { name: 'Pork Fried Rice', description: 'Wok-fried rice with diced pork, scrambled eggs, peas, carrots, and scallions in soy sauce.', image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&auto=format' },
      { name: 'Greek Gyro Wrap', description: 'Seasoned lamb and beef with tzatziki sauce, tomatoes, onions, and lettuce in warm pita.', image_url: 'https://images.unsplash.com/photo-1561651823-34feb02571dc?w=400&h=300&fit=crop&auto=format' },
      { name: 'Chicken Burrito Bowl', description: 'Seasoned chicken, cilantro-lime rice, black beans, corn salsa, guacamole, and sour cream.', image_url: 'https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?w=400&h=300&fit=crop&auto=format' },
      { name: 'Pho (Vietnamese Soup)', description: 'Traditional beef bone broth soup with rice noodles, thinly sliced beef, and fresh herbs.', image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&h=300&fit=crop&auto=format' },
    ],
    desserts: [
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey molten center, served with vanilla ice cream.', image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop&auto=format' },
      { name: 'New York Cheesecake', description: 'Rich and creamy classic cheesecake with a graham cracker crust and strawberry topping.', image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop&auto=format' },
      { name: 'Fresh Fruit Tart', description: 'Buttery pastry shell filled with vanilla custard and topped with glazed seasonal fruits.', image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&auto=format' },
      { name: 'Chocolate Chip Cookies', description: 'Freshly baked golden cookies loaded with semi-sweet chocolate chips. Warm from the oven.', image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop&auto=format' },
      { name: 'Tiramisu', description: 'Classic Italian dessert with layers of espresso-soaked ladyfingers and mascarpone cream.', image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop&auto=format' },
      { name: 'Apple Pie', description: 'Homestyle apple pie with cinnamon-spiced filling and a flaky golden crust, served warm.', image_url: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400&h=300&fit=crop&auto=format' },
      { name: 'Brownies', description: 'Fudgy chocolate brownies with a crackly top, made with premium cocoa and real butter.', image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop&auto=format' },
      { name: 'Vanilla Bean Ice Cream', description: 'Creamy vanilla bean ice cream made with real Madagascar vanilla, served in a waffle cone or cup.', image_url: 'https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=400&h=300&fit=crop&auto=format' },
      { name: 'Crème Brûlée', description: 'Silky vanilla custard with a caramelized sugar crust, served chilled in a ramekin.', image_url: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop&auto=format' },
      { name: 'Banana Pudding', description: 'Southern-style layered banana pudding with vanilla wafers and whipped cream topping.', image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&auto=format' },
      { name: 'Red Velvet Cupcake', description: 'Moist red velvet cupcake topped with tangy cream cheese frosting and red velvet crumbs.', image_url: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=300&fit=crop&auto=format' },
      { name: 'Churros with Chocolate Sauce', description: 'Crispy fried churros dusted in cinnamon sugar, served with warm chocolate dipping sauce.', image_url: 'https://images.unsplash.com/photo-1624371414361-e670246e6449?w=400&h=300&fit=crop&auto=format' },
    ],
  };

  // Track inserted item IDs for ratings/reviews
  const insertedItems = [];

  for (const [category, items] of Object.entries(foodItems)) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { data: inserted, error } = await supabase
        .from('food_items')
        .insert({ ...item, tab_category: category })
        .select()
        .single();

      if (error) {
        console.error(`  Error: ${item.name}: ${error.message}`);
        continue;
      }

      await supabase.from('monthly_cycles').insert({
        month_year: monthYear,
        food_item_id: inserted.id,
        tab_category: category,
        display_order: i,
      });

      insertedItems.push({ id: inserted.id, name: inserted.name });
      console.log(`  ${item.name}`);
    }
  }

  // ========== 3. STAR RATINGS (10–25 per item) ==========
  console.log('\n--- Seeding star ratings ---');
  let totalRatings = 0;

  for (const item of insertedItems) {
    const target = TARGET_RATINGS[item.name] || 3.5;
    const count = Math.floor(Math.random() * 16) + 10; // 10–25
    const ratings = generateRatings(target, count);

    const rows = ratings.map((r) => ({
      food_item_id: item.id,
      month_year: monthYear,
      rating: r,
      device_fingerprint: randomFingerprint(),
      ip_address: randomIP(),
    }));

    const { error } = await supabase.from('star_ratings').insert(rows);
    if (error) console.error(`  Ratings error for ${item.name}: ${error.message}`);
    else {
      totalRatings += count;
      const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
      console.log(`  ${item.name}: ${count} ratings (avg ~${avg})`);
    }
  }
  console.log(`  Total: ${totalRatings} ratings`);

  // ========== 4. WRITTEN REVIEWS (3–5 per item) ==========
  console.log('\n--- Seeding written reviews ---');
  let totalReviews = 0;

  for (const item of insertedItems) {
    const reviews = ITEM_REVIEWS[item.name];
    if (!reviews) continue;

    const reviewers = pickReviewers(reviews.length);

    for (let i = 0; i < reviews.length; i++) {
      const reviewer = reviewers[i];
      const { error } = await supabase.from('written_reviews').insert({
        food_item_id: item.id,
        month_year: monthYear,
        email: reviewer.email,
        graduation_year: reviewer.grad,
        gender: reviewer.gender,
        review_text: reviews[i],
      });
      if (error) console.error(`  Review error: ${error.message}`);
      else totalReviews++;
    }
  }
  console.log(`  Total: ${totalReviews} reviews`);

  // ========== 5. SUGGESTION CARDS WITH VOTES ==========
  console.log('\n--- Seeding suggestion cards ---');

  const suggestions = [
    {
      title: 'Korean BBQ Bowl',
      description: 'Grilled marinated beef or tofu over rice with kimchi and sesame sauce.',
      image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop&auto=format',
      upvotes: 47, downvotes: 6,
    },
    {
      title: 'Shakshuka',
      description: 'Middle Eastern baked eggs in spiced tomato sauce, served with pita bread.',
      image_url: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=400&h=300&fit=crop&auto=format',
      upvotes: 38, downvotes: 11,
    },
    {
      title: 'Birria Tacos',
      description: 'Slow-braised beef tacos with consomme dipping broth and pickled onions.',
      image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop&auto=format',
      upvotes: 61, downvotes: 4,
    },
    {
      title: 'Miso Ramen Bar',
      description: 'Build-your-own ramen with broth, noodles, and toppings station.',
      image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&auto=format',
      upvotes: 73, downvotes: 8,
    },
    {
      title: 'Stuffed Bell Peppers',
      description: 'Roasted peppers filled with seasoned rice, ground turkey, and melted cheese.',
      image_url: 'https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=400&h=300&fit=crop&auto=format',
      upvotes: 29, downvotes: 15,
    },
  ];

  for (const s of suggestions) {
    const { data: card, error } = await supabase
      .from('suggestion_cards')
      .insert({
        month_year: monthYear,
        title: s.title,
        description: s.description,
        image_url: s.image_url,
      })
      .select()
      .single();

    if (error) {
      console.error(`  Error: ${s.title}: ${error.message}`);
      continue;
    }

    // Seed upvotes
    const upvoteRows = Array.from({ length: s.upvotes }, () => ({
      suggestion_card_id: card.id,
      vote_type: 'upvote',
      device_fingerprint: randomFingerprint(),
      ip_address: randomIP(),
      month_year: monthYear,
    }));

    // Seed downvotes
    const downvoteRows = Array.from({ length: s.downvotes }, () => ({
      suggestion_card_id: card.id,
      vote_type: 'downvote',
      device_fingerprint: randomFingerprint(),
      ip_address: randomIP(),
      month_year: monthYear,
    }));

    const allVotes = [...upvoteRows, ...downvoteRows];
    const { error: voteErr } = await supabase.from('suggestion_votes').insert(allVotes);
    if (voteErr) console.error(`  Votes error for ${s.title}: ${voteErr.message}`);
    else console.log(`  ${s.title}: +${s.upvotes} / -${s.downvotes}`);
  }

  // ========== 6. CUISINE & DISH RECOMMENDATIONS ==========
  console.log('\n--- Seeding recommendations ---');

  const recommendations = [
    { rec_type: 'cuisine', text: 'Japanese' },
    { rec_type: 'cuisine', text: 'Japanese food' },
    { rec_type: 'cuisine', text: 'sushi' },
    { rec_type: 'cuisine', text: 'Korean' },
    { rec_type: 'cuisine', text: 'Korean BBQ' },
    { rec_type: 'cuisine', text: 'Mexican' },
    { rec_type: 'cuisine', text: 'more Mexican options' },
    { rec_type: 'cuisine', text: 'Thai' },
    { rec_type: 'cuisine', text: 'Thai curry' },
    { rec_type: 'cuisine', text: 'Indian' },
    { rec_type: 'cuisine', text: 'Indian food' },
    { rec_type: 'cuisine', text: 'Mediterranean' },
    { rec_type: 'cuisine', text: 'Italian' },
    { rec_type: 'cuisine', text: 'more pasta' },
    { rec_type: 'cuisine', text: 'Vietnamese' },
    { rec_type: 'cuisine', text: 'Pho' },
    { rec_type: 'cuisine', text: 'Middle Eastern' },
    { rec_type: 'cuisine', text: 'Greek' },
    { rec_type: 'cuisine', text: 'more Asian options' },
    { rec_type: 'cuisine', text: 'fusion' },
    { rec_type: 'cuisine', text: 'Japanese ramen' },
    { rec_type: 'cuisine', text: 'Korean food' },
    { rec_type: 'cuisine', text: 'more Mexican please' },
    { rec_type: 'dish', text: 'ramen' },
    { rec_type: 'dish', text: 'sushi rolls' },
    { rec_type: 'dish', text: 'bibimbap' },
    { rec_type: 'dish', text: 'tacos al pastor' },
    { rec_type: 'dish', text: 'pad thai' },
    { rec_type: 'dish', text: 'butter chicken' },
    { rec_type: 'dish', text: 'shawarma' },
    { rec_type: 'dish', text: 'gyros' },
    { rec_type: 'dish', text: 'pho' },
    { rec_type: 'dish', text: 'banh mi' },
    { rec_type: 'dish', text: 'dumplings' },
    { rec_type: 'dish', text: 'potstickers' },
    { rec_type: 'dish', text: 'mango sticky rice' },
    { rec_type: 'dish', text: 'tiramisu' },
    { rec_type: 'dish', text: 'churros' },
    { rec_type: 'dish', text: 'falafel wrap' },
    { rec_type: 'dish', text: 'naan pizza' },
    { rec_type: 'dish', text: 'teriyaki salmon' },
    { rec_type: 'dish', text: 'lobster bisque' },
    { rec_type: 'dish', text: 'truffle pasta' },
    { rec_type: 'dish', text: 'ramen noodles' },
    { rec_type: 'dish', text: 'spicy ramen' },
    { rec_type: 'dish', text: 'tonkotsu ramen' },
    { rec_type: 'dish', text: 'tacos' },
    { rec_type: 'dish', text: 'sushi' },
    { rec_type: 'dish', text: 'pad thai noodles' },
    { rec_type: 'dish', text: 'dumpling soup' },
  ];

  const recRows = recommendations.map((r) => ({
    month_year: monthYear,
    rec_type: r.rec_type,
    text: r.text,
    ip_address: randomIP(),
  }));

  const { error: recErr } = await supabase.from('recommendations').insert(recRows);
  if (recErr) console.error(`  Error: ${recErr.message}`);
  else console.log(`  ${recommendations.length} recommendations seeded`);

  // ========== 7. PRE-GENERATED AI SUMMARY ==========
  console.log('\n--- Seeding AI summary ---');

  const aiSummary = {
    top_cuisines: [
      { cuisine: 'Japanese', count: 8, related_terms: ['Japanese', 'Japanese food', 'sushi', 'Japanese ramen'] },
      { cuisine: 'Korean', count: 5, related_terms: ['Korean', 'Korean BBQ', 'Korean food'] },
      { cuisine: 'Mexican', count: 4, related_terms: ['Mexican', 'more Mexican options', 'more Mexican please'] },
      { cuisine: 'Thai', count: 3, related_terms: ['Thai', 'Thai curry'] },
      { cuisine: 'Indian', count: 3, related_terms: ['Indian', 'Indian food'] },
      { cuisine: 'Vietnamese', count: 2, related_terms: ['Vietnamese', 'Pho'] },
      { cuisine: 'Mediterranean / Middle Eastern', count: 3, related_terms: ['Mediterranean', 'Middle Eastern', 'Greek'] },
      { cuisine: 'Italian', count: 2, related_terms: ['Italian', 'more pasta'] },
    ],
    top_dishes: [
      { dish: 'Ramen', count: 6, related_terms: ['ramen', 'ramen noodles', 'spicy ramen', 'tonkotsu ramen'] },
      { dish: 'Tacos / Tacos al Pastor', count: 4, related_terms: ['tacos', 'tacos al pastor'] },
      { dish: 'Sushi Rolls', count: 3, related_terms: ['sushi rolls', 'sushi'] },
      { dish: 'Pad Thai', count: 3, related_terms: ['pad thai', 'pad thai noodles'] },
      { dish: 'Dumplings / Potstickers', count: 3, related_terms: ['dumplings', 'potstickers', 'dumpling soup'] },
      { dish: 'Pho', count: 2, related_terms: ['pho'] },
      { dish: 'Shawarma / Gyros', count: 2, related_terms: ['shawarma', 'gyros'] },
      { dish: 'Butter Chicken', count: 1, related_terms: ['butter chicken'] },
      { dish: 'Banh Mi', count: 1, related_terms: ['banh mi'] },
      { dish: 'Falafel Wrap', count: 1, related_terms: ['falafel wrap'] },
    ],
    total_cuisine_recommendations: 23,
    total_dish_recommendations: 27,
    summary: "This month's recommendations strongly favor Asian cuisines, particularly Japanese and Korean. Ramen is the single most requested dish by a significant margin, suggesting a dedicated ramen bar or Japanese-themed dinner night would be well received. Mexican options also showed strong demand, with specific interest in street-style tacos. Recommend prioritizing a Japanese or Korean feature night this cycle, with a Mexican option as a secondary focus.",
  };

  const { error: aiErr } = await supabase.from('ai_summaries').insert({
    month_year: monthYear,
    summary_json: aiSummary,
  });
  if (aiErr) console.error(`  Error: ${aiErr.message}`);
  else console.log('  AI summary seeded');

  // ========== DONE ==========
  console.log('\n========================================');
  console.log('Seed complete!');
  console.log(`Month: ${monthYear}`);
  console.log(`Food items: ${insertedItems.length}`);
  console.log(`Star ratings: ${totalRatings}`);
  console.log(`Written reviews: ${totalReviews}`);
  console.log(`Suggestion cards: ${suggestions.length}`);
  console.log(`Recommendations: ${recommendations.length}`);
  console.log('AI summary: 1');
  console.log('\nCredentials:');
  for (const acct of accounts) {
    console.log(`  [${acct.role}] ${acct.username} / ${acct.password}`);
  }
  console.log('========================================');
}

seed().catch(console.error);
