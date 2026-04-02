import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import TemporaryTable from "../components/shared/tables/TemporaryTable";

import TextInputField from "../components/shared/TextInputField";
import NumberInputField from "../components/shared/NumberInputField";
import AmountInputField from "../components/shared/AmountInputField";

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    qty: "",
    price: "",
    discount: "",
  });

  const [tableData, setTableData] = useState([]);

  const columns = [
    { key: "name", label: "Name", type: "text" },
    { key: "qty", label: "Quantity", type: "number" },
    { key: "price", label: "Price", type: "number" },
    { key: "discount", label: "Discount", type: "number" },
  ];

  const handleAddRow = () => {
    setTableData([...tableData, formData]);
    setFormData({ name: "", qty: "", price: "", discount: "" });
  };

  const handleSubmit = () => {
    console.log("Submit data:", tableData);
    // send tableData to backend
  };

  return (
    <Box p={2} display="flex" flexDirection="column" gap={2}>
      {/* Input Fields in Grid */}
      <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
        <TextInputField
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <NumberInputField
          label="Quantity"
          value={formData.qty}
          onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
        />
        <AmountInputField
          label="Price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        />
        <AmountInputField
          label="Discount"
          value={formData.discount}
          onChange={(e) =>
            setFormData({ ...formData, discount: e.target.value })
          }
        />
        {/* Add button spans both columns */}
        <Box gridColumn="span 2" display="flex" justifyContent="flex-start">
          <Button variant="contained" onClick={handleAddRow}>
            Add
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TemporaryTable columns={columns} data={tableData} setData={setTableData} />

      {/* Submit Button */}
      <Box display="flex" justifyContent="flex-start" mt={1}>
  <Button variant="contained" color="primary" onClick={handleSubmit}>
    Submit All
  </Button>
</Box>

    </Box>
  );
}
