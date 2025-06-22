import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CategoryPopup.css";

const CategoryPopup = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(null);
      setName(""); // ✅ Reset name when popup closes
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <button
          className="close-button"
          onClick={() => {
            onClose();
            navigate("/");
          }}
        >
          ✖
        </button>
        <h1>Welcome to Cricket Trivia</h1> {/* ✅ Updated Title to match Figma */}
        
        <h2>Enter Your Name</h2>
        <input
          type="text"
          className="input-field"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <h2>Select Your Quiz Category</h2>
        <div className="category-buttons">
          {["History", "Players", "Records", "Rules", "Miscellaneous"].map((category) => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? "selected" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <button
          className="proceed-button"
          onClick={() => {
            if (!name.trim()) {
              alert("Please enter your name before proceeding!");
              return;
            }
            navigate(`/quiz/${selectedCategory}?name=${encodeURIComponent(name)}`);
          }}
          disabled={!selectedCategory || !name.trim()} // ✅ Ensures both category & name are required
        >
          Proceed to Quiz
        </button>
      </div>
    </div>
  );
};

export default CategoryPopup;
