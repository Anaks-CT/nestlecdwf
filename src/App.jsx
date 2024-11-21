import { useEffect, useRef, useState } from "react";
import "./App.css";
const CLIENT_ID =
  "268057375417-n3bu2koi5v487v0a9vdat4hqh06go7l7.apps.googleusercontent.com"; // Replace with your Client ID
const API_KEY = "AIzaSyD6r0wuIFrbEnMT_YS8pLHotyKyJDJzmjM"; // Optional, you may need it
const SHEET_ID = "1mQAE6mQZmgjM-lH2UaINJxExRHD-4dMgFuKSbfIKQ1A"; // Replace with your Google Sheet ID
const SCOPE = "https://www.googleapis.com/auth/spreadsheets"; // Scope for Sheets API
function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize the Google API client
  useEffect(() => {
    window.gapi.load("client", initClient);
  }, []);

  const initClient = () => {
    window.gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [
          "https://sheets.googleapis.com/$discovery/rest?version=v4",
        ],
        scope: SCOPE,
      })
      .then(() => {
        setIsLoaded(true);  // Mark as loaded once the client is initialized
      })
      .catch((error) => {
        console.error("Error initializing Google API client", error);
      });
  };

  const schoolNames = [
    "Greenwood High School",
    "Hill View Academy",
    "Riverdale International",
    "Sunnydale Public School",
    "Springfield High",
  ];
  const maintenanceTypes = [
    "Electrical",
    "Plumbing",
    "HVAC",
    "Landscaping",
    "Cleaning",
    "Painting",
    "Roofing",
    "Carpentry",
    "Security Systems",
    "Other",
  ];

  // State for form inputs
  const initialFormData = {
    schoolName: "",
    maintenanceTypes: [],
    day: "",
    month: "",
    year: "",
    cost: "",
    notes: "",
    files: [],
  };
  const [formData, setFormData] = useState({
    schoolName: "",
    maintenanceTypes: [],
    day: "",
    month: "",
    year: "",
    cost: "",
    notes: "",
    files: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { value } = e.target;
    setFormData((prevData) => {
      const newMaintenanceTypes = prevData.maintenanceTypes.includes(value)
        ? prevData.maintenanceTypes.filter((type) => type !== value)
        : [...prevData.maintenanceTypes, value];
      return {
        ...prevData,
        maintenanceTypes: newMaintenanceTypes,
      };
    });
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 5) {
      alert("You can only select up to 5 files.");
      return;
    }
    setFormData((prevData) => ({
      ...prevData,
      files: Array.from(files),
    }));
  };
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({
    schoolName: "",
    maintenanceTypes: "",
    day: "",
    month: "",
    year: "",
    cost: "",
    notes: "",
  });

  const validateForm = () => {
    let isValid = true;
    let errors = {};

    // Check for required fields
    if (!formData.schoolName) {
      isValid = false;
      errors.schoolName = "Required";
    }

    if (formData.maintenanceTypes.length === 0) {
      isValid = false;
      errors.maintenanceTypes = "Required";
    }

    if (!formData.day) {
      isValid = false;
      errors.day = "Required";
    }

    if (!formData.month) {
      isValid = false;
      errors.month = "Required";
    }

    if (!formData.year) {
      isValid = false;
      errors.year = "Required";
    }

    if (!formData.cost) {
      isValid = false;
      errors.cost = "Required";
    }

    if (!formData.notes) {
      isValid = false;
      errors.notes = "Required";
    }

    setErrors(errors); // Set error messages
    return isValid;
  };

  // Append data to Google Sheets
  const appendDataToSheet = (formData) => {
    const { schoolName, maintenanceTypes, day, month, year, cost, notes } = formData;

    const values = [
      [schoolName, maintenanceTypes.join(", "), `${day}/${month}/${year}`, cost, notes],
    ];

    window.gapi.client.sheets.spreadsheets.values
      .append({
        spreadsheetId: SHEET_ID,
        range: "Sheet1!A:F",  // Ensure this range matches your Google Sheet layout
        valueInputOption: "RAW",
        resource: {
          values: values,
        },
      })
      .then(() => {
        alert("Data added to Google Sheets!");
      })
      .catch((error) => {
        console.error("Error appending data:", error);
        alert("Failed to add data.");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      if (!isLoaded) {
        alert("Google Sheets API is still loading. Please wait.");
        return;
      }
      appendDataToSheet();
      setFormData(initialFormData);
    }
  };
  const handleButtonClick = () => {
    // Trigger the file input click event when the button is clicked
    fileInputRef.current.click();
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <img
            className="nestle-image"
            src="https://lh6.googleusercontent.com/n7fv-aj8wutIwox7RWWi9Aj4zw_WyasOR3wG_ytpUmdigldSrhjz2Z6IQeK-vo_MruRuLWAEJ-UK3HyL5WJB7rA0RINRXE1z1wKrIAT8hjrIjqZTAwoZYZMGhoL2bnXAvQ=w795"
            alt=""
          />
          <h2>CDWF Maintenance & Repairs</h2>

          <div className="input-group input-group-icon school-dropdown">
            <select
              name="schoolName"
              className="dropdown-input"
              value={formData.schoolName}
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Select School Name
              </option>
              {schoolNames.map((school, index) => (
                <option key={index} value={school}>
                  {school}
                </option>
              ))}
            </select>
            <div className="input-icon">
              <i className="fa fa-school"></i>
            </div>
            {errors.schoolName && (
              <span style={{ color: "red", fontSize: "11px" }}>
                {errors.schoolName}
              </span>
            )}
          </div>

          <div className="row">
            <div className="input-group input-group-checkbox">
              <p className="input-name">Type of Maintenance</p>
              {maintenanceTypes.map((type, index) => (
                <div key={index} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`maintenance-${type}`}
                    value={type}
                    onChange={handleCheckboxChange}
                    checked={formData.maintenanceTypes.includes(type)}
                  />
                  <label htmlFor={`maintenance-${type}`}>{type}</label>
                </div>
              ))}
            </div>
            {errors.maintenanceTypes && (
              <span style={{ color: "red", fontSize: "11px" }}>
                {errors.maintenanceTypes}
              </span>
            )}
          </div>
        </div>

        <div className="row">
          <div className="input-group date">
            <p className="input-name">Date of Work</p>
            <div className="col-third">
              <input
                type="number"
                name="day"
                placeholder="DD"
                value={formData.day}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-third">
              <input
                type="number"
                name="month"
                placeholder="MM"
                value={formData.month}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-third">
              <input
                type="number"
                name="year"
                placeholder="YYYY"
                value={formData.year}
                onChange={handleInputChange}
              />
            </div>
            {errors.year && (
              <span style={{ color: "red", fontSize: "11px" }}>
                {errors.year}
              </span>
            )}
          </div>
        </div>

        <div className="input-group input-group-icon">
          <input
            type="text"
            name="cost"
            placeholder="Cost Incurred"
            value={formData.cost}
            onChange={handleInputChange}
          />
          <div className="input-icon">
            <i className="fa fa-user"></i>
          </div>
          {errors.cost && (
            <span style={{ color: "red", fontSize: "11px" }}>
              {errors.cost}
            </span>
          )}
        </div>

        <div className="input-group input-group-icon">
          <input
            type="text"
            name="notes"
            placeholder="Additional Notes (Mention Work)"
            value={formData.notes}
            onChange={handleInputChange}
          />
          <div className="input-icon">
            <i className="fa fa-user"></i>
          </div>
          {errors.notes && (
            <span style={{ color: "red", fontSize: "11px" }}>
              {errors.notes}
            </span>
          )}
        </div>

        <div className="input-group input-group-icon input-group-file">
          <div className="file-input-wrapper">
            <div className="input-icon">
              <i className="fa fa-user"></i>
            </div>
            <p>Receipt Picture</p>
            <input
              ref={fileInputRef}
              type="file"
              id="receipt-picture"
              name="receiptPicture"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }} // Hide the default file input
            />
            <button
              type="button"
              className="select-file-btn"
              onClick={handleButtonClick}
            >
              Select File
            </button>
          </div>
          <div id="filePreview">
            {formData.files.length > 0 &&
              formData.files.map((file, index) => (
                <div key={index}>{file.name}</div>
              ))}
          </div>
        </div>

        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;
