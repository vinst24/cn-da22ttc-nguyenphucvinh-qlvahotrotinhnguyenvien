// useAuth.js
import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // Import AuthContext để truy cập vào giá trị context

export const useAuth = () => {
  return useContext(AuthContext); // Trả về giá trị của AuthContext (auth, logout, handleRefresh)
};
