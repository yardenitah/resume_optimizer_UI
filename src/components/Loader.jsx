// components/Loader.jsx
import React from "react";
import { Spinner } from "react-bootstrap";

const Loader = () => {
  return (
    <Spinner
      animation="border"
      role="status"
      style={{
        width: "100px",
        height: "100px",
        margin: "auto",
        marginTop: "140px",
        display: "block",
      }}
    ></Spinner>
  );
};

export default Loader;