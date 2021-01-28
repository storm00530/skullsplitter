import React, { useCallback, useState, useEffect } from "react";
import {
  Button,
  Card,
  DataTable,
  Thumbnail,
  Modal,
  TextField,
} from "@shopify/polaris";
export default function CollectionTable(props) {
  const [collectionRows, setCollectionRows] = useState([]);
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const [weight, setWeight] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const [updateId, setUpdateId] = useState(0);
  const [delModalActive, setDelModalActive] = useState(false);
  const [delId, setDelId] = useState(0);
  useEffect(() => {
    console.log("useEffect called");
    let add_table_cell = [];
    let collection = props.passData;
    let thumbnail;
    let actionBtn;
    let id = count;
    let col_id;
    let isUpdate = shouldUpdate(collection.id);
    if (
      Object.keys(collection).length !== 0 &&
      collection.constructor === Object &&
      isUpdate
    ) {
      thumbnail = (
        <Thumbnail source={collection.imgSRC} alt={collection.title} />
      );
      col_id = collection.id;
      add_table_cell.push(count);
      add_table_cell.push(thumbnail);
      add_table_cell.push(col_id);
      add_table_cell.push(collection.title);
      add_table_cell.push(collection.discount_percent);
      add_table_cell.push(collection.discount_min);
      add_table_cell.push(collection.discount_max);
      actionBtn = (
        <>
          <Button
            onClick={() => {
              handleUpdateModel(count);
            }}
          >
            Update
          </Button>
          <Button
            onClick={() => {
              handleDeleteModal(count);
            }}
          >
            Delete
          </Button>
        </>
      );

      add_table_cell.push(actionBtn);

      console.log(add_table_cell);

      setCollectionRows((prevState) => {
        return [...prevState, add_table_cell];
      });
    } else {
      console.log("Empty Object!");
    }
    return function () {
      setCount((count) => {
        return count + 1;
      });
    };
  }, [props.passData]);

  useEffect(() => {
    console.log("unexpected changes");
    props.getStateData(collectionRows);
  }, [collectionRows]);
  const shouldUpdate = (id) => {
    let currentStateArray = collectionRows;
    for (let i = 0; i < currentStateArray.length; i++) {
      const singleVal = currentStateArray[i];
      if (singleVal.includes(id)) {
        return false;
      }
    }
    return true;
  };
  const handleDeleteTable = () => {
    console.log(delId);
    console.log(collectionRows);

    const item = collectionRows.filter((item) => item[0] !== delId);

    setCollectionRows(item);
    setDelModalActive(false);
  };
  const handleDeleteModal = useCallback(
    (id) => {
      setDelId(id);
      setDelModalActive(!delModalActive);
    },
    [delModalActive]
  );
  const handleUpdate = () => {
    console.log("UpdateId: ", updateId);
    console.log("weight :", weight, minValue, maxValue);
    let tableRows = collectionRows;
    let update_id = updateId;
    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      if (row[0] === update_id) {
        tableRows[i][4] = weight;
        tableRows[i][5] = minValue;
        tableRows[i][6] = maxValue;
      }
    }
    setActive(!active);
    setCollectionRows(tableRows);
  };
  const handleUpdateModel = useCallback(
    (id) => {
      setUpdateId(id);
      setActive(!active);
    },
    [active]
  );

  const handleWeightChange = useCallback((newValue) => setWeight(newValue), []);
  const handleMinChange = useCallback((newValue) => setMinValue(newValue), []);
  const handleMaxChange = useCallback((newValue) => setMaxValue(newValue), []);

  return (
    <Card>
      <DataTable
        columnContentTypes={[
          "numeric",
          "text",
          "text",
          "text",
          "numeric",
          "numeric",
          "numeric",
          "text",
        ]}
        headings={[
          "Id",
          "Collections",
          "Collection Id",
          "Collection Title",
          "Collection Weights(%)",
          "Minimum Discount(%)",
          "Maximum Discount(%)",
          "Action",
        ]}
        rows={collectionRows}
        footerContent={`Showing ${collectionRows.length} of ${collectionRows.length} results`}
      />
      <Modal
        open={delModalActive}
        onClose={handleDeleteModal}
        primaryAction={{
          content: "Yes",
          onAction: handleDeleteTable,
        }}
        secondaryActions={[
          {
            content: "No",
            onAction: handleDeleteModal,
          },
        ]}
      >
        <Modal.Section>
          <p style={{ textAlign: "center", padding: "20px" }}>
            Are you sure that you want to delete this item?
          </p>
        </Modal.Section>
      </Modal>

      <Modal
        // activator={activator}
        open={active}
        onClose={handleUpdateModel}
        title="Update Discount Information"
        primaryAction={{
          content: "Update",
          onAction: handleUpdate,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleUpdateModel,
          },
        ]}
      >
        <Modal.Section>
          <TextField
            label="Weight"
            type="number"
            value={weight}
            onChange={handleWeightChange}
          />
          <TextField
            label="Minimum"
            type="number"
            value={minValue}
            onChange={handleMinChange}
          />
          <TextField
            label="Maximun"
            type="number"
            value={maxValue}
            onChange={handleMaxChange}
          />
        </Modal.Section>
      </Modal>
    </Card>
  );

  function sortCurrency(rows, index, direction) {
    return [...rows].sort((rowA, rowB) => {
      const amountA = parseFloat(rowA[index].substring(1));
      const amountB = parseFloat(rowB[index].substring(1));

      return direction === "descending" ? amountB - amountA : amountA - amountB;
    });
  }
}
