import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/auth.js';
import routineRoutes from './routes/routines.js';
import bookingRoutes from './routes/bookings.js';
import challengeRoutes from './routes/challenges.js';
import messageRoutes from './routes/messages.js';
import mealPlanRoutes from './routes/mealplans.js';

dotenv.config();

// Connect to Database (with auto-fallback to local JSON files)
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// API Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/mealplans', mealPlanRoutes);
// Mock AI Meal Planner Engine
app.post('/api/ai/meal-plan', (req, res) => {
  const { weight, height, activity, goal, diet } = req.body;

  if (!weight || !height) {
    return res.status(400).json({ message: 'Please provide weight and height for calculation' });
  }

  // Calculate dummy BMR/Calorie targets based on user physical metrics
  const bmr = Math.round(10 * Number(weight) + 6.25 * Number(height) - 5 * 25 + 5);
  let multiplier = 1.2;
  if (activity === 'moderate') multiplier = 1.55;
  if (activity === 'high') multiplier = 1.725;

  let targetCalories = Math.round(bmr * multiplier);
  if (goal === 'weight-loss') targetCalories -= 500;
  if (goal === 'muscle-gain') targetCalories += 400;

  // Meal selections based on diet selector
  let plan = {
    calories: targetCalories,
    protein: Math.round(Number(weight) * (goal === 'muscle-gain' ? 2.0 : 1.5)),
    carbs: Math.round((targetCalories * 0.45) / 4),
    fat: Math.round((targetCalories * 0.25) / 9),
    days: {
      breakfast: "Oatmeal with sliced banana, flaxseeds, and a scoop of protein powder",
      lunch: "Grilled chicken breast sandwich with mixed green salad and avocado dressing",
      snack: "Greek yogurt with a handful of almonds and blue berries",
      dinner: "Baked salmon fillet served with brown rice and steamed broccoli broccoli"
    },
    groceryList: [
      "Protein Powder (Whey or Plant)",
      "Rolled Oats & Bananas",
      "Chicken Breast & Whole Wheat Bread",
      "Mixed Salad Greens & Avocado",
      "Greek Yogurt & Almonds",
      "Salmon Fillets & Brown Rice",
      "Fresh Broccoli & Blueberries"
    ]
  };

  if (diet === 'vegan') {
    plan.days.breakfast = "Chia seed pudding made with almond milk, strawberries, and hemp seeds";
    plan.days.lunch = "Quinoa bowl with seasoned black beans, avocado, roasted sweet potato, and spinach";
    plan.days.snack = "Hummus with carrots, cucumber, and celery sticks";
    plan.days.dinner = "Stir-fried firm tofu with snap peas, bell peppers, carrots, and brown rice";
    plan.groceryList = [
      "Chia Seeds & Hemp Seeds",
      "Almond Milk & Strawberries",
      "Quinoa & Black Beans",
      "Avocado & Sweet Potato",
      "Tofu & Brown Rice",
      "Hummus & Mixed Vegetables (Carrots, Celery, Peppers, Snap Peas)"
    ];
  } else if (diet === 'keto') {
    plan.days.breakfast = "Three eggs scrambled in butter with spinach and crumbled feta cheese";
    plan.days.lunch = "Double beef burger patty salad bowl with bacon, cheddar cheese, and sour cream";
    plan.days.snack = "Celery sticks with full-fat peanut butter or cream cheese";
    plan.days.dinner = "Garlic butter ribeye steak with asparagus spears and cauliflower mash";
    plan.groceryList = [
      "Eggs & Grass-fed Butter",
      "Feta Cheese & Cheddar Cheese",
      "Bacon & Beef Burger Patties",
      "Ribeye Steaks & Sour Cream",
      "Spinach & Asparagus",
      "Cauliflower & Peanut Butter"
    ];
  }

  res.json({
    success: true,
    plan
  });
});

// Root check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AegisFit API is running.',
    mode: global.useLocalDB ? 'Local JSON Fallback File DB' : 'MongoDB Connection'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
  console.log(`Fallback file DB status: ${global.useLocalDB ? 'ACTIVE' : 'INACTIVE (MongoDB online)'}`);
});
