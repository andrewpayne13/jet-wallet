import { useContext } from "react";
import { PricesContext } from "../context/PricesContext";

export const usePrices = () => {
  return useContext(PricesContext);
};
