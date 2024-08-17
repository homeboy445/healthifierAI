import React, { useContext, useEffect, useState } from "react";
import { MedicineObject } from "../../types/types";
import { v4 as uuid } from "uuid";
import globalContext from "../../contexts/globalContext";
import deleteIcon from "../../assets/delete.png";
import { Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./medicinePage.css";

const MedicinePage = () => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayToday = new Date().getDay();

  const globalContextHandler = useContext(globalContext);
  const [medicineList, updateMedicineList] = useState<{
    [dayNumber: number]: Array<MedicineObject>;
  }>({
    0: [],
  });

  const [formVisible, setFormVisible] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    usage: "",
    day: new Date().getDay(),
    time: "",
  });
  const [showDeletePopUp, toggleDeletePopUp] = useState<{
    deleteStandBy: (value: boolean) => void;
    state: boolean;
  }>({ deleteStandBy: () => {}, state: false });

  const toggleForm = () => {
    setFormVisible(!formVisible);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewMedicine({ ...newMedicine, [name]: value });
  };

  const CardComponent: React.FC<{
    name: string;
    usage: string;
    dosage: string;
    timeLeft: string;
    medicineDeleteCb: () => void;
  }> = ({ name, usage, dosage, timeLeft, medicineDeleteCb }) => {
    return (
      <Card style={{ width: "18rem" }}>
        <Card.Body>
          <Card.Title>{name}</Card.Title>
          <Card.Text>
            <strong>Usage:</strong> {usage} <br />
            <strong>Dosage:</strong> {dosage} <br />
            {timeLeft && <><strong>Time Left:</strong> {timeLeft}</>}
          </Card.Text>
          <Button variant="outline-danger" onClick={() => medicineDeleteCb()}>
            Remove
          </Button>
        </Card.Body>
      </Card>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedicine.time || !newMedicine.name || !newMedicine.dosage) {
      return;
    }
    const dayNumber = parseInt(newMedicine.day.toString());
    const newMedicineObject: MedicineObject = {
      name: newMedicine.name,
      dosage: newMedicine.dosage,
      time: { hour: newMedicine.time, day: dayNumber },
      usage: newMedicine.usage,
      medicineId: "",
    };
    globalContextHandler
      .request("medicine/store")
      .post({ ...newMedicineObject })
      .then((response) => {
        console.log("Medicine response -> ", response);
        updateMedicineList({
          ...medicineList,
          [dayNumber]: [...(medicineList[dayNumber] || []), newMedicineObject],
        });
      })
      .catch((e) => {
        console.log("error in storing medicine -> ", e);
      });
    setNewMedicine({
      name: "",
      dosage: "",
      usage: "",
      day: 0,
      time: "",
    });
    toggleForm();
  };

  const handleDeleteRequest = (
    medicineId: string,
    dayIdx: number,
    eleIdx: number
  ) => {
    const deletePrompt = new Promise((resolve) => {
      toggleDeletePopUp({ deleteStandBy: resolve, state: true });
    });
    deletePrompt.then((response) => {
      if (response) {
        globalContextHandler
          .request(`medicine/${medicineId}`)
          .delete()
          .then((response) => {
            if (response.data === "Success") {
              const updatedMedicineObj = { ...medicineList };
              updatedMedicineObj[dayIdx].splice(eleIdx, 1);
              updateMedicineList(updatedMedicineObj);
            }
          });
      }
    });
  };

  const handleDeleteToggle = (state: boolean) => {
    showDeletePopUp.deleteStandBy(state);
    toggleDeletePopUp({ state: false, deleteStandBy: () => {} });
  };

  const convertToDisplayTime = (timeString: string) => {
    const [hour, min] = timeString.split(":");
    const dateObj = new Date();
    dateObj.setHours(+hour);
    dateObj.setMinutes(+min);
    return dateObj;
  };

  function getRelativeTime(targetTime: Date) {
    const currentTime = new Date();
    // Calculate the difference in milliseconds
    const timeDifference = targetTime.getTime() - currentTime.getTime();
    // If the target time is in the past, adjust it to represent the next occurrence
    if (timeDifference < 0) {
      targetTime.setDate(targetTime.getDate() + 1); // Set to the same time on the next day
    }
    // Recalculate the difference in milliseconds
    const adjustedTimeDifference = targetTime.getTime() - currentTime.getTime();
    // Convert milliseconds to hours, minutes, and seconds
    const hours = Math.floor(adjustedTimeDifference / (1000 * 60 * 60));
    const minutes = Math.floor(
      (adjustedTimeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );
    return `${hours} hours, ${minutes} minutes from now`;
  }

  useEffect(() => {
    globalContextHandler
      .request("medicine/all")
      .get()
      .then((response) => {
        console.log("medicine all response -> ", response);
        if (response.data?.length > 0) {
          const medicineStore = { ...medicineList };
          response.data.forEach((item: MedicineObject) => {
            medicineStore[item.time.day] = medicineStore[item.time.day] || [];
            medicineStore[item.time.day].push(item);
          });
          updateMedicineList(medicineStore);
        }
      })
      .catch((e) => {
        console.log("error in getting medicines -> ", e);
      });
  }, []);

  const today = new Date().getDay();
  return (
    <div style={{ width: "100%" }}>
      <div
        className={`main-medicinePage ${
          formVisible || showDeletePopUp.state ? "disabled" : ""
        }`}
        style={{
          overflow: formVisible || showDeletePopUp.state ? "hidden" : "auto",
        }}
      >
        {daysOfWeek.map((day, dayIndex) => {
          return (
            <div className="medicine-daywise-container" key={uuid()}>
              <h2 className="medicine-daywise-container-title">{dayIndex === today ? `Today - ${day}` : day}</h2>
              {(medicineList[dayIndex] || []).length > 0 ? (
                <div className="medicine-daywise-container-grid">
                  {medicineList[dayIndex].map((medicine, idx) => {
                    return CardComponent({
                      name: medicine.name,
                      usage: medicine.usage,
                      dosage: medicine.dosage,
                      timeLeft: dayIndex === today ? getRelativeTime(
                        convertToDisplayTime(medicine.time.hour)
                      ): "",
                      medicineDeleteCb: () =>
                        handleDeleteRequest(medicine.medicineId, dayIndex, idx),
                    });
                  })}
                </div>
              ) : (
                <div className="medicine-daywise-no-medicine">
                  No Medicine scheduled for this day!
                </div>
              )}
            </div>
          );
        })}
        <button className="medicine-add-btn" onClick={toggleForm}>
          Add New+
        </button>
      </div>
      {showDeletePopUp.state && (
        <div className="medicine-addition-form">
          <h1>Are you sure to delete this medicine schedule ?</h1>
          <div className="medicine-addition-form-btns">
            <button
              type="submit"
              className="main-btn"
              onClick={() => handleDeleteToggle(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className="main-cnl-btn"
              onClick={() => handleDeleteToggle(false)}
            >
              No
            </button>
          </div>
        </div>
      )}
      {formVisible && (
        <div className="form-overlay">
          <form className="medicine-addition-form" onSubmit={handleSubmit}>
            <h2>Add New Medicine</h2>
            <input
              type="text"
              name="name"
              placeholder="Medicine Name"
              value={newMedicine.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="dosage"
              placeholder="Medicine Dosage"
              value={newMedicine.dosage}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="usage"
              placeholder="Medicine Usage"
              value={newMedicine.usage}
              onChange={handleInputChange}
              required
            />
            <div className="medicine-day-time">
              <div className="base-flex">
                <label htmlFor="day">Day:</label>
                <select
                  name="day"
                  value={newMedicine.day}
                  onChange={handleInputChange}
                >
                  {daysOfWeek.map((day, index) => (
                    <option key={uuid()} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="base-flex">
                <label htmlFor="time">Select a time:</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={newMedicine.time}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="medicine-addition-form-btns">
              <button type="submit" className="main-btn">
                Add
              </button>
              <button
                type="button"
                className="main-cnl-btn"
                onClick={toggleForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MedicinePage;
