import React, { useEffect, useState } from "react";
import { MedicineObject } from "../../types/types";
import { v4 as uuid } from "uuid";
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
  const [medicineList, updateMedicineList] = useState<{
    [dayNumber: number]: Array<MedicineObject>;
  }>({
    0: [
      {
        name: "Paracetamol",
        dosage: "500mg",
        time: { hour: "", day: 0 },
        usage: "For fever",
      },
      {
        name: "Paracetamol",
        dosage: "500mg",
        time: { hour: "", day: 0 },
        usage: "For fever",
      },
      {
        name: "Paracetamol",
        dosage: "500mg",
        time: { hour: "", day: 0 },
        usage: "For fever",
      },
      {
        name: "Paracetamol",
        dosage: "500mg",
        time: { hour: "", day: 0 },
        usage: "For fever",
      },
    ],
    1: [
      {
        name: "Ibuprofen",
        dosage: "200mg",
        time: { hour: "", day: 1 },
        usage: "For pain",
      },
    ],
  });

  return (
    <div className="main-medicinePage">
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
    </div>
  );
};

export default MedicinePage;
