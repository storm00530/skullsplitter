import React, { useCallback, useState, useEffect } from "react";
import {
  AppProvider,
  Icon,
  VisuallyHidden,
  ActionList,
  Frame,
  TopBar,
  Modal,
} from "@shopify/polaris";
import { SaveMinor, QuestionMarkMajor } from "@shopify/polaris-icons";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import $ from "jquery";
import axios from "axios";
const Collectionlist = gql`
  query {
    collections(first: 50) {
      edges {
        node {
          id
          title
          image {
            src
          }
        }
      }
    }
  }
`;

export default function TopBarComponent(props) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [collection_info, setCollectioinInfo] = useState({});
  const [searchItem, setSeachItem] = useState([]);
  const [saveActive, setSaveActive] = useState(false);
  var countCollections = 5;
  const [searchItemActive, setSearchItemActive] = useState(true);
  const [savemodalActive, setSavemodalActive] = useState(false);
  const [discountCode, setDiscountCode] = useState("");

  useEffect(() => {
    const req_data = {
      post_name: "get_db",
      data: "data",
    };
    axios
      .post("/getData", req_data)
      .then((res) => {
        for (let i = 0; i < res.data.length; i++) {
          const rowData = res.data[i];
          setCollectioinInfo(rowData);
        }
      })
      .catch((err) => {
        console.log("err get data : ", err.message);
      });
  }, []);

  const createDiscount = (code, percent) => {
    const discountData = {
      discount_code: code,
      discount_percent: percent,
    };
    axios
      .post("/createDiscount", discountData)
      .then((res) => {
        console.log("success :", res);
      })
      .catch((err) => {
        console.log("err : ", err.message);
      });
  };

  const onSave_database = () => {
    let propsData = props.passStateData;
    let setNumberLeft = props.setNumber;
    let reqData = [];

    setSavemodalActive(false);
    for (let i = 0; i < propsData.length; i++) {
      const singlerow = propsData[i];

      let singleRowData = {};
      singleRowData.id = singlerow[2];
      singleRowData.title = singlerow[3];
      singleRowData.imgSRC = singlerow[1].props.source;
      singleRowData.discount_percent = singlerow[4];
      singleRowData.discount_min = singlerow[5];
      singleRowData.discount_max = singlerow[6];
      singleRowData.discount_code = "discountcode";
      singleRowData.leftNumber = setNumberLeft;
      reqData.push(singleRowData);
    }
    axios
      .post("/postData", reqData)
      .then((res) => {
        console.log("post data :", res);
      })
      .catch((err) => {
        console.log("err post data : ", err.message);
      });
  };
  const check_onSave_database = useCallback(
    () => setSavemodalActive(!savemodalActive),
    [savemodalActive]
  );
  const toggleIsUserMenuOpen = useCallback(() => {
    setIsUserMenuOpen((isUserMenuOpen) => !isUserMenuOpen);
    setSaveActive((prevState) => !prevState);

    if (saveActive) check_onSave_database();
  }, [saveActive]);

  const toggleIsSecondaryMenuOpen = useCallback(
    () => setIsSecondaryMenuOpen((isSecondaryMenuOpen) => !isSecondaryMenuOpen),
    []
  );

  const handleSearchResultsDismiss = useCallback(() => {
    setIsSearchActive(false);
    setSearchValue("");
  }, []);

  const handleSearchChange = useCallback(
    (value) => {
      setSearchValue(value);
      setIsSearchActive(value.length > 0);
      let search = [];
      for (let i = 0; i < countCollections; i++) {
        const element = {};
        element.content = CollectionList(i, searchValue);
        search.push(element);
      }

      setSeachItem(search);
    },
    [searchValue]
  );
  useEffect(() => {
    $("ul.Polaris-ActionList__Actions>li>button").each(function () {
      if ($(this).find(".no-search-result").length > 0) $(this).hide();
      else $(this).show();
    });
  }, [searchItem]);
  const handleNavigationToggle = useCallback(() => {
    console.log("toggle navigation visibility");
  }, []);

  const onClickItem = useCallback((title, image, col_Id) => {
    let collection = {};
    collection.title = title;
    collection.imgSRC = image;
    collection.id = col_Id.split("/")[4];
    collection.discount_percent = 20;
    collection.discount_min = 10;
    collection.discount_max = 30;
    setCollectioinInfo(collection);
  }, []);

  useEffect(() => {
    props.getPassData(collection_info);
  }, [collection_info]);

  const theme = {
    colors: {
      topBar: {
        background: "#225062",
      },
    },
    logo: {
      width: 66,
      topBarSource:
        "https://cdn.shopify.com/s/files/1/1066/8352/files/SkullSplitter_Dice_Logo_1_small.jpg?v=1601405473",
      url: "https://www.skullsplitterdice.com/",
      accessibilityLabel: "Skullsplitterdice",
    },
  };
  const userMenuMarkup = (
    <TopBar.UserMenu
      actions={[
        {
          items: [{ content: "Save Changes", icon: SaveMinor }],
        },
        {
          items: [{ content: "Email Developer" }],
        },
      ]}
      name="Ted core"
      detail="Skullsplitterdice"
      initials="T"
      open={isUserMenuOpen}
      onToggle={toggleIsUserMenuOpen}
    />
  );

  const CollectionList = (index, value) => {
    return (
      <Query query={Collectionlist}>
        {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) return <div>Error :(</div>;
          let CollectionTitle = [];
          let CollectionImage = [];
          let CollectionId = [];
          for (let i = 0; i < data.collections.edges.length; i++) {
            const Col_id = data.collections.edges[i].node.id;
            const Col_title = data.collections.edges[i].node.title;
            const Col_image = data.collections.edges[i].node.image.src;
            CollectionTitle.push(Col_title);
            CollectionImage.push(Col_image);
            CollectionId.push(Col_id);
          }
          if (
            CollectionTitle[index]
              .toUpperCase()
              .includes(value.toUpperCase()) === false
          ) {
            return <div className="no-search-result">No Search Results</div>;
          }
          return (
            <div
              className="collection-search-result"
              onClick={() => {
                onClickItem(
                  CollectionTitle[index],
                  CollectionImage[index],
                  CollectionId[index]
                );
              }}
            >
              <img
                width="150"
                src={CollectionImage[index]}
                style={{
                  marginRight: "20px",
                  width: "50px",
                  height: "50px",
                  display: "inline-block",
                }}
              />
              <span>{CollectionTitle[index]}</span>
            </div>
          );
        }}
      </Query>
    );
  };
  const searchResultsMarkup = <ActionList items={searchItem} />;

  const searchFieldMarkup = (
    <TopBar.SearchField
      onChange={handleSearchChange}
      value={searchValue}
      placeholder="Search"
      showFocusBorder
    />
  );

  const secondaryMenuMarkup = (
    <TopBar.Menu
      activatorContent={
        <span>
          <Icon source={QuestionMarkMajor} />
          <VisuallyHidden>Secondary menu</VisuallyHidden>
        </span>
      }
      open={isSecondaryMenuOpen}
      onOpen={toggleIsSecondaryMenuOpen}
      onClose={toggleIsSecondaryMenuOpen}
      actions={[
        {
          items: [{ content: "Read this guide" }],
        },
      ]}
    />
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      secondaryMenu={secondaryMenuMarkup}
      searchResultsVisible={isSearchActive}
      searchField={searchFieldMarkup}
      searchResults={searchResultsMarkup}
      onSearchResultsDismiss={handleSearchResultsDismiss}
      onNavigationToggle={handleNavigationToggle}
    />
  );

  return (
    <div style={{ height: "85px" }}>
      <Modal
        open={savemodalActive}
        onClose={check_onSave_database}
        primaryAction={{
          content: "Save",
          onAction: onSave_database,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: check_onSave_database,
          },
        ]}
      >
        <Modal.Section>
          <p style={{ textAlign: "center", padding: "20px" }}>
            Are you sure that you want to save the current data?
          </p>
        </Modal.Section>
      </Modal>
      <AppProvider
        theme={theme}
        i18n={{
          Polaris: {
            Avatar: {
              label: "Avatar",
              labelWithInitials: "Avatar with initials {initials}",
            },
            Frame: { skipToContent: "Skip to content" },
            TopBar: {
              toggleMenuLabel: "Toggle menu",
              SearchField: {
                clearButtonLabel: "Clear",
                search: "Search",
              },
            },
          },
        }}
      >
        <Frame topBar={topBarMarkup} />
      </AppProvider>
    </div>
  );
}
