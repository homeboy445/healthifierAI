import React, { useState, useContext } from "react";
import globalContext from "../../contexts/globalContext";
import { storeAuthTokens } from "../../utils/Auth";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isError, updateErrorState] = useState(false);
  const mainContext = useContext(globalContext);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = () => {
    // Add your logic here to submit the email and password
    console.log("Email:", email);
    console.log("Password:", password);
    if (!email || !password) {
      return;
    }
    mainContext.request("login", {}, { avoidAuthHeaders: true })
    .post({ email: email.trim(), password: password.trim() })
    .then((response) => {
        if (response.isError) {
          throw new Error("Error in logging in!");
        }
        console.log("login response:", response.data);
        mainContext.updateLoggedInState(true);
        storeAuthTokens(response.data);
    })
    .catch((err) => {
      console.log("error in logging in!");
      updateErrorState(true);
      setTimeout(() => {
        updateErrorState(false);
      }, 5000);
    });
  };

  return (
    <form className="login-page" style={ (isError ? { border: "2px solid red" }: {}) } onSubmit={(e) => e.preventDefault()}>
      <h1>Login to your account.</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={handleEmailChange}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={handlePasswordChange}
        required
      />
      <button className="main-btn" type="submit" onClick={handleSubmit}>Submit</button>
    </form>
  );
};

export default Login;
