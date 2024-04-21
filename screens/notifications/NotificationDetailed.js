import { Card, Text } from "react-native-paper";
import { View } from "react-native";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

const NotificationDetailed = (props) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    notificationContainer: {
      padding: 20,
      flex: 1,
      alignItems: "flex-start",
      backgroundColor: theme.colors.tertiary,
    },
    detailedText: {
      marginTop: 20,
      backgroundColor: theme.colors.secondary,
      minHeight: 300,
    },
  });

  notification = props.route.params.notification;
  //console.log(notification.route.params.notification)
  return (
    <View style={styles.notificationContainer}>
      <Text variant="headlineLarge">{notification.name}</Text>
      <Card style={styles.detailedText}>
        <Card.Content>
          <Text variant="bodyLarge">{notification.detailedText}</Text>
        </Card.Content>
      </Card>
    </View>
  );
};
export default NotificationDetailed;