make a health tracker app

- simple username and password login
- add a name
- simple databse

The login / sign up page should be VERY attractive.

use postgres as the database.

use prisma as the ORM.

use next.js and tailwind css for the frontend.

do the authentication with auth.js

make the app look very attractive.

use shadcn/ui for the components.
use it completely for the sign in and sign up page.
everything frontend should be done with shadcn/ui, that should be your first thought.

we are using next.js 15.


refer the documentation for next.js 15 and next auth 5.


Below is a schema for the database.

### **Clients Table**
- **ClientID** (Number) - Primary Key
- **FirstName** (Short Text) - NOT NULL
- **LastName** (Short Text) - NOT NULL
- **Age** (Number - Integer) - CHECK (Age >= 18 AND Age <= 80)
- **Gender** (Short Text) - Must be "Male," "Female," or "Other"
- **Contact** (Short Text) - UNIQUE, NOT NULL
- **Email** (Short Text) - UNIQUE, NOT NULL
- **JoinDate** (Date/Time) - Default: Current Date

---

### **Health Metrics Table**
- **MetricID** (AutoNumber) - Primary Key
- **DateRecorded** (Date/Time) - Default: Current Date, NOT NULL
- **HeartRate** (Number) - CHECK (HeartRate >= 40 AND HeartRate <= 200)
- **BloodPressure** (Short Text) - Format: "SYS/DIA" (e.g., "120/80")
- **SleepHours** (Number - Double) - CHECK (SleepHours >= 0 AND SleepHours <= 24)
- **Weight** (Number - Double) - CHECK (Weight >= 30 AND Weight <= 200)
- **BMI** (Number - Double) - CHECK (BMI >= 10 AND BMI <= 50)

---

### **Diet Logs Table**
- **DietID** (AutoNumber) - Primary Key
- **DateLogged** (Date/Time) - Default: Current Date
- **MealType** (Short Text) - Must be "Breakfast," "Lunch," "Dinner," or "Snack"
- **Calories** (Number) - CHECK (Calories >= 0 AND Calories <= 5000)
- **Protein** (Number) - CHECK (Protein >= 0 AND Protein <= 300)
- **Carbs** (Number)
- **Fats** (Number)

---

### **Workout Log Table**
- **WorkoutID** (AutoNumber) - Primary Key
- **DateLogged** (Date/Time) - Default: Current Date, NOT NULL
- **WorkoutType** (Short Text) - Example: "Cardio," "Strength Training," "Yoga"
- **Duration** (Number) - CHECK (Duration > 0 AND Duration <= 300)
- **CaloriesBurned** (Number) - CHECK (CaloriesBurned > 0 AND CaloriesBurned <= 300)

---

### **Health - Suggestion Table**
- **MetricID** (Number) - Foreign Key
- **SuggestionID** (Number) - Primary Key
- **ClientID** (Number) - Foreign Key
- **DietID** (Number) - Foreign Key
- **SuggestionType** (Short Text) - Must be "Diet," "Workout," or "Rest"
- **PersonalisedSuggestion** (Long Text) - NOT NULL
- **DateIssued** (Date/Time)
