import React, { useContext, useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import "./plansPage.css";
import globalContext from "../../contexts/globalContext";

enum PlanType {
  MEAL = "meal",
  WORKOUT = "workout",
}

const MESSAGE_STORE = {
  [PlanType.MEAL]:
    "This is the personalised meal plan specifically designed to help you reach your health goals.",
  [PlanType.WORKOUT]:
    "This is the personalised workout plan specifically designed to help you reach your health & muscle building goals.",
};

const PlansPage = () => {
  const globalContextHandler = useContext(globalContext);
  const [currentPlan, setCurrentPlan] = useState(PlanType.MEAL);
  const [planDataFetched, updatePlanDataFetchedState] = useState<{
    [key in PlanType]?: boolean;
  }>({});
  const [planWiseData, updatePlanWiseData] = useState<{
    [key in PlanType]: string;
  }>({ [PlanType.MEAL]: "", [PlanType.WORKOUT]: "" });
  const [planWiseRawData, updatePlanWiseRawData] = useState<{
    [key in PlanType]: string;
  }>({ [PlanType.MEAL]: "", [PlanType.WORKOUT]: "" });
  const [improvmentPromptHandler, updateImprovementPrompt] =
    useState<string>("");
  const [copiedToClipBoardBtn, updateBtnTxt] = useState("Copy Plan To Clipboard");

  const updatePlan = (planType: PlanType) => {
    setCurrentPlan(planType);
  };

  const makeRegenerateRequest = () => {
    const improvmentText = improvmentPromptHandler.trim();
    if (!improvmentText) {
      return;
    }
    const originalPlan = planWiseData[currentPlan];
    updatePlanWiseData({ ...planWiseData, [currentPlan]: "" });
    updateImprovementPrompt("");
    globalContextHandler
      .request("plan/regenerate")
      .post({ planType: currentPlan, improvementPrompt: improvmentText })
      .then(async (response) => {
        const { planDetails } = response.data as any;
        console.log("regeneration response:", response);
        console.log("current planWise data: ", planWiseData);
        updatePlanWiseData({
          ...planWiseData,
          [currentPlan]: DOMPurify.sanitize(await marked.parse(planDetails)),
        });
      })
      .catch((e) => {
        console.log("Error -> ", e);
        updatePlanWiseData({ [currentPlan]: originalPlan, ...planWiseData });
      });
  };

  useEffect(() => {
    if (!planDataFetched[currentPlan]) {
      const requestPath = `plan/${
        currentPlan === PlanType.MEAL ? "meal" : "workout"
      }`;
      globalContextHandler
        .request(requestPath)
        .get()
        .then(async (response) => {
          const { planDetails } = response.data as any;
          console.log("response:", response);
          updatePlanWiseData({
            ...planWiseData,
            [currentPlan]: DOMPurify.sanitize(await marked.parse(planDetails)),
          });
          updatePlanWiseRawData({
            ...planWiseRawData,
            [currentPlan]: planDetails
          });
        })
        .catch((err) => {
          console.log("error:", err);
        });
      updatePlanDataFetchedState({ ...planDataFetched, [currentPlan]: true });
    }
  }, [currentPlan, planWiseData]);

  return (
    <div className="main-planPage">
      <h1>Health Planner</h1>
      <div className="plan-type-container">
        {Object.values(PlanType).map((planType) => {
          return (
            <h2
              style={{
                background:
                  currentPlan === planType ? "#65CCB8" : "transparent",
                color: currentPlan === planType ? "white" : "black",
                textShadow:
                  currentPlan === planType ? "0.5px 0.5px 0.5px black" : "none",
              }}
              onClick={() => updatePlan(planType)}
            >
              {planType[0].toUpperCase() + planType.slice(1)} Plan
            </h2>
          );
        })}
      </div>
      <div className="plan-regenerator">
        <input
          type="text"
          placeholder="Add your comments here"
          value={improvmentPromptHandler}
          onChange={(e) => {
            console.log("## ", e.target.value);
            updateImprovementPrompt(e.target.value);
          }}
        />
        <button className="main-btn" onClick={() => makeRegenerateRequest()}>
          Regenerate Plan
        </button>
      </div>
      <div className="plan-container">
        If you need to make any corrections/improvements, add your comments
        above and regenerate the plan. {MESSAGE_STORE[currentPlan]}
        <div
          dangerouslySetInnerHTML={{
            __html: planWiseData[currentPlan]?.trim()
              ? planWiseData[currentPlan]
              : "<h1>Loading...</h1>",
          }}
        ></div>
      </div>
      <button className="main-btn cpy-plan" onClick={() => {
        const copyToClipboard = async () => {
          try {
            await navigator.clipboard.writeText(planWiseRawData[currentPlan]);
            console.log('Text copied to clipboard');
          } catch (err) {
            console.error('Failed to copy text: ', err);
          }
        };
        copyToClipboard().then(() => {
          updateBtnTxt("Copied to Clipboard");
          setTimeout(() => {
            updateBtnTxt("Copy Plan To Clipboard");
          }, 2000);
        });
      }}>{copiedToClipBoardBtn}</button>
    </div>
  );
};

export default PlansPage;
