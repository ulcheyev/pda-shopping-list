import { Button, FAB, Text, TextInput, useTheme } from "react-native-paper";
import ListCard from "../../components/ListCard";
import * as React from "react";
import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import useDataManager from "../../services/DataManager";
import MonkeyModal from "../../components/MonkeyModal";
import { createStackNavigator } from "@react-navigation/stack";
import Header from "../../components/Header";
import ShoppingList from "./ShoppingList";
import useUtils from "../../utils/Utils";
import Register from "../user-related/Register";
import Login from "../user-related/Login";
import UserInfo from "../user-related/UserInfo";
import CheckmarkSpinner from "../../components/CheckmarkSpinner";
import { useChanges } from "../../services/ChangesProvider";
import { useFocusEffect } from "@react-navigation/native";
import { SwipeListView } from "react-native-swipe-list-view";
import { TouchableOpacity } from "react-native-gesture-handler";

const ShoppingListsContent = (props) => {
  const [addListModalVisible, setAddListModalVisible] = useState(false);
  const dataManager = useDataManager();
  const changesProvider = useChanges();
  const utils = useUtils();
  const [lists, setLists] = useState([]);
  const [isError, setIsError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [creationListName, setCreationListName] = React.useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const styles = StyleSheet.create({
    listsContainer: {
      flex: 1,
      alignItems: "flex-start",
      paddingTop: 4,
      backgroundColor: theme.colors.tertiary,
    },
    fab: {
      position: "absolute",
      margin: 15,
      padding: 4,
      right: 10,
      bottom: 15,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
    },
    button: {
      marginBottom: 15,
      backgroundColor: "#85AF9D",
    },
    buttonTitleStyle: {
      color: theme.colors.tertiary,
    },
    modalContainer: {
      borderTopRightRadius: 15,
      borderTopLeftRadius: 15,
    },
    modalContentStyle: {
      padding: 15,
      flex: 1,
      flexDirection: "column",
      backgroundColor: theme.colors.primary,
      borderTopRightRadius: 15,
      borderTopLeftRadius: 15,
    },
    listNameInput: {
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
      backgroundColor: theme.colors.tertiary,
    },

    templateContainer: {
      flex: 1,
      flexDirection: "row",
      width: "100%",
      gap: 20,
      alignItems: "center",
      marginBottom: 25,
    },

    templateLabel: {
      color: theme.colors.tertiary,
      fontSize: 17,
    },

    templateButton: {
      flexGrow: 1,
      backgroundColor: theme.colors.tertiary,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      marginTop: 10,
    },

    emptyListContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "100%",
    },
    templateButtonTitleStyle: {
      color: "#565555",
    },
    rowBack: {
      alignItems: "center",
      backgroundColor: "red",
      margin: 7,
      flex: 1,
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingLeft: 15,
      borderRadius: 7,
    },
    backRightBtn: {
      alignItems: "center",
      bottom: 0,
      justifyContent: "flex-end",
      top: 0,
      width: 75,
      borderBottomRightRadius: 7,
      borderTopRightRadius: 7,
    },
    backRightBtnRight: {
      backgroundColor: "red",
      flex: 1,
      height: "100%",
      flexDirection: "column",
      justifyContent: "center",
      right: 0,
    },
    backTextWhite: {
      color: "#FFF",
    },
  });

  const fabOnPress = () => {
    setAddListModalVisible(true);
  };

  // todo kyrya
  const handleRefresh = () => {
    setRefreshing(true);
    utils.checkAuth().then((user) => {
      if (user) {
        dataManager.getAllLists().then((res) => {
          setLists(res);
          setRefreshing(false);
        });
      } else {
        setRefreshing(false);
        setLists([]);
      }
    });
  };

  const hideAddItemModal = () => {
    setAddListModalVisible(false);
    setCreationListName("");
    setIsError(false);
  };

  const createList = () => {
    if (!creationListName) {
      setIsError(true);
      return;
    }
    const newList = {
      id: lists.length + 1,
      name: creationListName,
      isTemplate: false,
      progress: 0,
      shops: [],
      uid: dataManager.getCurrentUser().uid,
    };
    dataManager
      .saveList(newList)
      .then(() => {
        setLists([...lists, newList]);
      })
      .finally(() => {
        setAddListModalVisible(false);
        setCreationListName("");
        setIsError(false);
      });
  };

  const onChangeCreationListName = (text) => setCreationListName(text);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      utils.checkAuth().then((user) => {
        if (user) {
          dataManager.getAllLists().then((res) => {
            setLists(res);
            setLoading(false);
          });
        } else {
          setLoading(false);
          console.log("User is not authenticated");
        }
      }, []);
    }, []),
  );

  const handleDelete = (item) => {
    dataManager.deleteList(item).then((r) => handleRefresh());
  };

  const renderHiddenItem = (data) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => handleDelete(data.item)}
      >
        <Text style={styles.backTextWhite}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return loading ? (
    <CheckmarkSpinner loading={loading} />
  ) : (
    <View style={styles.listsContainer}>
      {lists && lists.length > 0 ? (
        <SwipeListView
          data={lists}
          disableRightSwipe={true}
          renderItem={(lizt) => (
            <ListCard
              handleRefresh={handleRefresh}
              list={lizt.item}
              progress={{
                value: lizt.item.progress,
                overall: utils.getListItemsSize(lizt.item),
              }}
              navigation={props.navigation}
            />
          )}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-75}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          alwaysBounceVertical={false}
        />
      ) : (
        <View style={styles.emptyListContainer}>
          <Text variant={"bodyLarge"}>Try to create a list :)</Text>
        </View>
      )}
      <FAB
        icon="pencil"
        color={theme.colors.tertiary}
        style={styles.fab}
        onPress={fabOnPress}
      />
      <MonkeyModal
        visible={addListModalVisible}
        hideModal={hideAddItemModal}
        modalContentStyle={styles.modalContentStyle}
        modalContainerStyle={styles.modalContainer}
        title={"Create a list"}
      >
        <View>
          <TextInput
            label="List name"
            value={creationListName}
            onChangeText={onChangeCreationListName}
            style={styles.listNameInput}
            error={isError && "red"}
          />
        </View>
        <View style={styles.templateContainer}>
          <Text style={styles.templateLabel}>Template</Text>
          <Button
            style={styles.templateButton}
            onPress={createList}
            labelStyle={styles.templateButtonTitleStyle}
          >
            Choose template...
          </Button>
        </View>
        <Button
          style={styles.button}
          onPress={createList}
          labelStyle={styles.buttonTitleStyle}
        >
          Create
        </Button>
      </MonkeyModal>
    </View>
  );
};

const ShoppingLists = () => {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      initialRouteName={"Shopping lists"}
      screenOptions={{
        header: (headerProps) => <Header {...headerProps} />,
      }}
    >
      <Stack.Screen name="Lists" component={ShoppingListsContent} />
      <Stack.Screen name={"ShoppingList"} component={ShoppingList} />
      <Stack.Screen name={"Register"} component={Register} />
      <Stack.Screen name={"Login"} component={Login} />
      <Stack.Screen name={"UserInfo"} component={UserInfo} />
    </Stack.Navigator>
  );
};

export default ShoppingLists;
