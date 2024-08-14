import React, { useContext, useEffect, useState } from "react";
import { MedicineObject } from "../../types/types";
import { v4 as uuid } from "uuid";
import "./medicinePage.css";
import globalContext from "../../contexts/globalContext";

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

  const globalContextHandler = useContext(globalContext);
  const [medicineList, updateMedicineList] = useState<{
    [dayNumber: number]: Array<MedicineObject>;
  }>({
    0: [],
    1: [],
  });

  const [formVisible, setFormVisible] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    usage: "",
    day: 0,
    time: "",
  });

  const toggleForm = () => {
    setFormVisible(!formVisible);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewMedicine({ ...newMedicine, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dayNumber = parseInt(newMedicine.day.toString());
    const newMedicineObject: MedicineObject = {
      name: newMedicine.name,
      dosage: newMedicine.dosage,
      time: { hour: newMedicine.time, day: dayNumber },
      usage: newMedicine.usage,
    };
    globalContextHandler.request("medicine/store")
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

  useEffect(() => {
    globalContextHandler.request("medicine/all")
    .get()
    .then((response) => {
      console.log('medicine all response -> ', response);
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

  return (
    <div style={{ width: "100%" }}>
      <div
        className={`main-medicinePage ${formVisible ? "disabled" : ""}`}
        style={{ overflow: formVisible ? "hidden" : "auto" }}
      >
        {daysOfWeek.map((day, dayIndex) => {
          return (
            <div className="medicine-daywise-container" key={uuid()}>
              <h2 className="medicine-daywise-container-title">{day}</h2>
              {(medicineList[dayIndex] || []).length > 0 ? (
                <div className="medicine-daywise-container-grid">
                  {medicineList[dayIndex].map((medicine) => {
                    return (
                      <div key={uuid()} className="medicine-card">
                        <h3>{medicine.name}</h3>
                        <p>Dosage: {medicine.dosage}</p>
                        <p>Usage: {medicine.usage}</p>
                      </div>
                    );
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
