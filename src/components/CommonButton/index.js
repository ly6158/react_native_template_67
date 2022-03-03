import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

class CommonButton extends React.Component {
  constructor(props) {
    super(props);
  }

  onClick() {
    if (this.props.click) {
      this.props.click();
    }
  }

  render() {
    const containerStyle =
      this.props.type === "primary"
        ? styles.container_primary
        : styles.container_normal;
    const contentStyle =
      this.props.type === "primary"
        ? styles.content_primary
        : styles.content_normal;

    const width = this.props.width || 150;

    return (
      <TouchableOpacity
        style={{ ...styles.touch, width }}
        onPress={() => this.onClick()}
        activeOpacity={0.5}>
        <View style={{ ...styles.container, ...containerStyle, width }}>
          <Text style={{ ...styles.content, ...contentStyle }}>
            {this.props.title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  touch: {
    height: 40,
  },
  container: {
    height: 40,
    borderRadius: 50,

    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    fontSize: 16,
  },
  container_primary: {
    backgroundColor: "#4481FE",
  },
  content_primary: {
    color: "#ffffff",
  },
  container_normal: {
    borderColor: "#4481FE",
    borderWidth: 1,
  },

  content_normal: {
    color: "#4481FE",
  },
});

export default CommonButton;
