import React, { useState } from "react";
import "./plansPage.css";

enum PlanType {
  MEAL_PLAN = "Meal Plan",
  WORKOUT_PLAN = "Workout Plan",
};

const MESSAGE_STORE = {
  [PlanType.MEAL_PLAN]: "This is the personalised meal plan specifically designed to help you reach your health goals.",
  [PlanType.WORKOUT_PLAN]: "This is the personalised workout plan specifically designed to help you reach your health & muscle building goals.",
}

const PlansPage = () => {
  const [currentPlan, setCurrentPlan] = useState(PlanType.MEAL_PLAN);

  const updatePlan = (planType: PlanType) => {
    setCurrentPlan(planType);
  };

  return (
    <div className="main-planPage">
      <h1>Health Planner</h1>
      <div className="plan-type-container">
        {Object.values(PlanType).map((planType) => {
          return (
            <h2
              style={{
                background: currentPlan === planType ? "#65CCB8" : "transparent",
                color: currentPlan === planType ? "white" : "black",
                textShadow: currentPlan === planType ? "0.5px 0.5px 0.5px black" : "none",
              }}
              onClick={() => updatePlan(planType)}
            >
              {planType}
            </h2>
          );
        })}
      </div>
      <div className="plan-regenerator">
        <input type="text" placeholder="Add your comments here" />
        <button className="main-btn">Regenerate Plan</button>
      </div>
      <div className="plan-container">
        If you need to make any corrections/improvements, add your comments above and regenerate the plan. {MESSAGE_STORE[currentPlan]}
      </div>
    </div>
  );
};

export default PlansPage;
