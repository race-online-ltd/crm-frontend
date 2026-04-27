import React, { useState, useEffect } from "react";
import { userContext } from "./UserContext";
import { decryptData } from "../utils/cryptoUtils";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user-info");
    const decryptedUser = storedUser ? decryptData(storedUser) : null;
    return decryptedUser;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user-info");
    if (storedUser) {
      setUser(decryptData(storedUser));
    }
  }, [localStorage.getItem("user-info")]);

  return (
    <userContext.Provider value={{ user, setUser }}>
      {children}
    </userContext.Provider>
  );
};
