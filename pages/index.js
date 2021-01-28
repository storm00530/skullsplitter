import { Page } from "@shopify/polaris";
import TopBarComponent from "./settings/Topbar";
import CollectionTable from "./settings/CollectionTable";
import NumberOfRollsPerDay from "./settings/NumberOfRollsPerDay";
import "./Global.css";

const Index = () => {
  const [passData, setPassData] = React.useState({});
  const [stateData, setStateData] = React.useState([]);
  const [numer_of_rolls, setNumer_of_rolls] = React.useState(0);
  const setPassDataFromTopBar = (value) => {
    setPassData(value);
  };
  const setSavedata = (value) => {
    setStateData(value);
  };
  const setNumerofRolls = (value) => {
    setNumer_of_rolls(value);
  };
  return (
    <Page>
      <TopBarComponent
        getPassData={setPassDataFromTopBar}
        passStateData={stateData}
        setNumber={numer_of_rolls}
      />
      <NumberOfRollsPerDay getNumberOfRolls={setNumerofRolls} />
      <CollectionTable passData={passData} getStateData={setSavedata} />
    </Page>
  );
};

export default Index;
