
import { useState, useEffect, createRef } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { AddBox, Edit, Visibility } from "@material-ui/icons";
import MuiTable from "../../components/table/table_index";
import { BASE_URL, PATH_BUS } from "../../utils/constants";
import makeApiCall from "../../utils/makeApiCall";

function BusTable() {

  const tableRef = createRef();
  const snackbar = useSnackbar();
  const navigate =  useNavigate();


  const columns = [
    { title: "BusId", field: "BusId", editable: "never" },
      { title: "BusNumber", field: "BusNumber" },
      { title: "MfgDate", field: "MfgDate" },
      { title: "Capacity", field: "Capacity" },
      { title: "RegistrationNumber", field: "RegistrationNumber" },
      { title: "Model", field: "Model" },
  ];
  
  const fetchData = async (query) => {
    return new Promise((resolve, reject) => {
      const { page, orderBy, orderDirection, search, pageSize } = query;
      const url = `${BASE_URL}${PATH_BUS}`;
      let temp = url; // Initialize with the base URL
      let filterQuery = ""; // Initialize filter query as an empty string
  
      // Handle sorting
      if (orderBy) {
        temp += `?$orderby=${orderBy.field} ${orderDirection}`;
      }
  
      // Handle searching
      if (search) {
        filterQuery = `$filter=contains($screen.getSearchField().getName(), '${search}')`;
        temp += orderBy ? `&${filterQuery}` : `?${filterQuery}`;
      }
  
      // Handle pagination
      if (page > 0) {
        const skip = page * pageSize;
        temp += orderBy || search ? `&$skip=${skip}` : `?$skip=${skip}`;
      }
  
      const countUrl = search ? `${url}/$count?${filterQuery}` : `${BASE_URL}${PATH_BUS}/$count`;
      let total = null;
  
      makeApiCall(countUrl)
        .then((res) => res.text())
        .then((e) => {
          total = parseInt(e, 10);
        })
        .then(() => makeApiCall(temp))
        .then((res) => res.json())
        .then(({ value }) => {
          return resolve({
            data: value,
            page: page,
            totalCount: total,
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  return (
    <div className="product-container">
      {
      (
        <MuiTable
          tableRef={tableRef}
          title="Buses Table"
          cols={columns}
          data={fetchData}
          size={5}
          actions={[
            {
              icon: AddBox,
              tooltip: "Add",
              onClick: () => navigate("/Buses/create"),
              isFreeAction: true,
            },
            {
              icon: Visibility,
              tooltip: "View",
              onClick: (event, rowData) =>
              navigate(`/Buses/view/${rowData.BusId}`),
            },
          ]}
          onRowDelete={async (oldData) => {
            const resp = await makeApiCall(
              `${BASE_URL}${PATH_BUS}(${oldData.BusId})`,
              "DELETE"
            );
            if (resp.ok) {
              tableRef.current.onQueryChange();
              snackbar.enqueueSnackbar("Successfully deleted Buses", {
                variant: "success",
              });
            } else {
              const jsonData = await resp.json();
              snackbar.enqueueSnackbar(`Failed! - ${jsonData.message}`, {
                variant: "error",
              });
            }
          }}
        />
      )}
    </div>
  );
}

export default BusTable;
