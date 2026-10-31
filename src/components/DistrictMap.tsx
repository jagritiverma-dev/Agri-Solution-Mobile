import { memo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import map from "../data/districtMapData.json";
import rawBounds from "../data/districtMapBounds.json";
import { districts } from "../data/districts";
import { farmerColors as c } from "../config/farmerTheme";
const bounds: Record<
  string,
  { x: number; y: number; width: number; height: number }
> = rawBounds;
const palette = ["#92C6AE", "#A9CBE5", "#D2B8DF", "#E5B69D", "#BFCF88"];
const paths = map.paths.filter((p) => !p.outline);
const names = new Map(districts.map((d) => [d.id, d]));
export const DistrictMap = memo(function DistrictMap({
  selected,
  onSelect,
  hi = false,
  visibleIds,
}: {
  selected: string;
  onSelect: (id: string) => void;
  hi?: boolean;
  visibleIds?: readonly string[];
}) {
  const [zoomed, setZoomed] = useState(false);
  const box = bounds[selected];
  const pad = box ? Math.max(box.width, box.height) * 0.35 : 0;
  const viewBox =
    zoomed && box
      ? `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`
      : "-8 -8 341.12 423.24664";
  const district = names.get(selected);
  return (
    <View style={s.card}>
      <View style={s.heading}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>
            {hi ? "हमर छत्तीसगढ़" : "OUR CHHATTISGARH"}
          </Text>
          <Text style={s.title}>
            {hi ? "नक्शे पर अपना जिला चुनें" : "Choose your district"}
          </Text>
        </View>
        <View style={s.badge}>
          <Text style={s.badgeText}>
            {visibleIds?.length ?? 33} {hi ? "जिले" : "districts"}
          </Text>
        </View>
      </View>
      <View style={s.canvas}>
        <View pointerEvents="none" style={s.north}>
          <Ionicons name="navigate" size={17} color={c.forest} />
          <Text style={s.northText}>{hi ? "उत्तर" : "N"}</Text>
        </View>
        <Svg
          width="100%"
          height={390}
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {paths.map((p, i) => {
            const active = p.id === selected;
            const visible = !visibleIds || visibleIds.includes(p.id);
            const name = names.get(p.id);
            return (
              <Path
                key={p.id}
                d={p.d}
                transform={p.transform || undefined}
                fill={active ? c.gold : palette[i % palette.length]}
                opacity={visible ? 1 : 0.18}
                stroke={active ? c.forest : "#56765B"}
                strokeWidth={active ? 2 : 0.8}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                accessibilityLabel={hi ? name?.hindiName : name?.districtName}
                onPress={visible ? () => onSelect(p.id) : undefined}
              />
            );
          })}
        </Svg>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            zoomed
              ? hi
                ? "पूरा नक्शा दिखाएं"
                : "Show full map"
              : hi
                ? "चयनित जिला बड़ा करें"
                : "Zoom into selected district"
          }
          disabled={!selected}
          onPress={() => setZoomed((v) => !v)}
          style={[s.zoom, !selected && { opacity: 0.35 }]}
        >
          <Ionicons
            name={zoomed ? "contract-outline" : "expand-outline"}
            size={20}
            color={c.forest}
          />
        </Pressable>
      </View>
      <View style={s.legend}>
        <View style={s.dot} />
        <Text style={s.caption}>{hi ? "जिले" : "Districts"}</Text>
        <View style={[s.dot, { backgroundColor: c.gold }]} />
        <Text style={s.caption}>{hi ? "आपका चयन" : "Selected"}</Text>
        <Text style={s.tap}>{hi ? "जिले पर टैप करें" : "Tap to explore"}</Text>
      </View>
      <View style={s.selection} accessibilityLiveRegion="polite">
        <Ionicons
          name={district ? "location" : "hand-left-outline"}
          size={20}
          color={c.forest}
        />
        <Text style={s.selectionText}>
          {district
            ? hi
              ? district.hindiName
              : district.districtName
            : hi
              ? "नक्शे या नीचे दी गई सूची से चुनें"
              : "Choose on the map or from the list below"}
        </Text>
        {district && (
          <Ionicons name="checkmark-circle" size={20} color={c.forest} />
        )}
      </View>
    </View>
  );
});
const s = StyleSheet.create({
  card: {
    backgroundColor: c.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: c.border,
    gap: 14,
  },
  heading: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyebrow: {
    color: c.muted,
    fontSize: 14,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  title: { color: c.forest, fontSize: 21, fontWeight: "800", marginTop: 5 },
  badge: {
    backgroundColor: c.paleGreen,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  badgeText: { color: c.forest, fontSize: 14, fontWeight: "700" },
  canvas: {
    backgroundColor: "#F3F5EC",
    borderRadius: 18,
    overflow: "hidden",
    padding: 10,
  },
  north: {
    position: "absolute",
    top: 14,
    right: 14,
    alignItems: "center",
    zIndex: 1,
  },
  northText: { fontSize: 14, color: c.forest, fontWeight: "800", marginTop: 3 },
  zoom: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    flexWrap: "wrap",
  },
  dot: { width: 10, height: 10, borderRadius: 3, backgroundColor: palette[0] },
  caption: { color: c.muted, fontSize: 14, marginRight: 8 },
  tap: { color: c.muted, fontSize: 14, marginLeft: "auto" },
  selection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: c.paleGreen,
    padding: 12,
    borderRadius: 12,
  },
  selectionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: c.forest,
    fontWeight: "600",
  },
});
