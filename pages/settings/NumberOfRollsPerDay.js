import React, { useCallback, useState, useEffect } from "react";
import { Card, TextField } from "@shopify/polaris";

export default function NumberOfRollsPerDay(props) {
  const [value, setValue] = useState(3);

  const handleChange = useCallback((newValue) => setValue(newValue), []);

  useEffect(() => {
    props.getNumberOfRolls(value);
  }, [value]);
  return (
    <Card sectioned>
      <TextField
        label="Number Of Rolls Per Day"
        type="number"
        value={value}
        placeholder={value}
        onChange={handleChange}
      />
    </Card>
  );
}
