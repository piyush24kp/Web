import React, { useContext, useEffect, useState } from "react";
import "./SentimentBar.css"; // Import the CSS file
import baseURLContext from '.././baseURLContext';
import { Box, Typography, LinearProgress } from "@mui/material";

const SentimentBar = () => {
  const baseURL = useContext(baseURLContext);
  const [data, setData] = useState({ advance: 0, decline: 0 });

  useEffect(() => {
    fetch(`${baseURL}:8080/api/v1/getOIAdvanceDecline`)
      .then((response) => response.json())
      .then((result) => setData({ advance: result.Advance, decline: result.Decline }))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const total = data.advance + data.decline;
  const advancePercentage = total > 0 ? (data.advance / total) * 100 : 0;
  const declinePercentage = total > 0 ? (data.decline / total) * 100 : 0;

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, p: 2, border: "1px solid #ddd", borderRadius: 2, bgcolor: "white", boxShadow: 1 }}>
    <Typography variant="subtitle1" sx={{ color: "#1f4b99", fontWeight: "bold", mb: 1 }}>
      Advance / Decline (NSE)
    </Typography>

    <Box sx={{ display: "flex", alignItems: "center", height: 10, borderRadius: 5, overflow: "hidden", bgcolor: "#ddd" }}>
      <Box sx={{ width: `${advancePercentage}%`, bgcolor: "#4caf50", height: "100%" }} />
      <Box sx={{ width: `${declinePercentage}%`, bgcolor: "#f44336", height: "100%" }} />
    </Box>

    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
      <Typography variant="caption" sx={{ color: "#4caf50", fontWeight: "bold" }}>{data.advance}</Typography>
      <Typography variant="caption" sx={{ color: "#f44336", fontWeight: "bold" }}>{data.decline}</Typography>
    </Box>
  </Box>
  );
};

export default SentimentBar;
