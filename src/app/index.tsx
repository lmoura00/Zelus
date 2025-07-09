import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 0.8;

const cards = Array.from({ length: 4 }).map((_, i) => ({
  key: String(i),
  text: "Receba atualizações",
  img: require("@/assets/rafiki.png"),
}));

export default function Index() {
  const router = useRouter();
  const [index, setIndex] = React.useState(0);

  function onScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(page);
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/background.png")}
        style={styles.background}
      />

      <Text style={styles.title}>Zelus</Text>

      <Text style={styles.subtitle}>Exemplo de {"\n"}subtítulo</Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        onMomentumScrollEnd={onScrollEnd}
      >
        {cards.map((card) => (
          <View key={card.key} style={styles.cardWrapper}>
            <View style={styles.card}>
              <Image source={card.img} style={styles.illustration} />

              <Text style={styles.cardText}>{card.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {cards.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/Login/page")}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => router.push("/Register/page")}
      >
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    position: "absolute",
    width,
    height,
    backgroundColor: "#EFAE0C",
  },
  title: {
    position: "absolute",
    top: 119,
    left: 30,
    fontFamily: "Nunito-Bold",
    fontSize: 32,
    color: "#FFFFFF",
  },
  subtitle: {
    position: "absolute",
    top: 163,
    left: 30,
    fontFamily: "Nunito-Bold",
    fontSize: 24,
    color: "#FFFFFF",
    marginTop: 4,
  },
  cardWrapper: {
    width,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    opacity: 0.9,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  illustration: {
    width: CARD_WIDTH * 0.8,
    height: CARD_HEIGHT * 0.6,
    marginBottom: 14,
    resizeMode: "contain",
  },
  cardText: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
    color: "#291F75",
  },
  dotsRow: {
    position: "absolute",
    top: height * 0.28 + CARD_HEIGHT + 120,
    width,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF88",
    marginHorizontal: 6,
  },
  dotActive: { backgroundColor: "#584CAF" },
  button: {
    position: "absolute",
    width: width * 0.8,
    left: width * 0.1,
    bottom: height * 0.22,
    backgroundColor: "#44399D",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  buttonSecondary: {
    position: "absolute",
    width: width * 0.8,
    left: width * 0.1,
    bottom: height * 0.14,
    backgroundColor: "#44399D",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  buttonText: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
});
