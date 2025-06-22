import React, { useEffect, useState } from "react";
import { getCategories } from "../services/api";
import { Button, Grid, CircularProgress } from "@mui/material";
import "../styles/category.css";

const CategorySelection = ({ setCategory }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategories().then(data => {
            setCategories(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="category-container">
            <h2 className="slide-in">Select a Quiz Category</h2>

            {loading ? (
                <CircularProgress color="primary" />
            ) : (
                <Grid container spacing={2} justifyContent="center">
                    {categories.map((category, index) => (
                        <Grid item key={index}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={() => setCategory(category)} 
                                className="bounce"
                            >
                                {category}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
};

export default CategorySelection;