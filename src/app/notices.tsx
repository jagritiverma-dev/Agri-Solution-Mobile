import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Share,
  Linking,
  Alert,
  StyleSheet,
} from "react-native";

import { usePortal } from "../hooks/PortalProvider";

import {
  noticeBoardData,
  type NoticeRecord,
  type NoticeCategory,
} from "../data/noticeBoardData";

type FilterCategory = "All" | NoticeCategory;

const FILTERS: {
  key: FilterCategory;
  en: string;
  hi: string;
}[] = [
  { key: "All", en: "All", hi: "सभी" },
  {
    key: "e-KYC & Accounts",
    en: "e-KYC",
    hi: "ई-केवाईसी",
  },
  {
    key: "Installments",
    en: "Payments",
    hi: "भुगतान",
  },
  {
    key: "Procurement",
    en: "Procurement",
    hi: "धान खरीदी",
  },
  {
    key: "Schemes",
    en: "Schemes",
    hi: "योजनाएं",
  },
  {
    key: "Advisory",
    en: "Advisory",
    hi: "सलाह",
  },
];

// Colors matching the current green-and-cream app appearance.
const COLORS = {
  primary: "#005C40",
  background: "#FAF7F0",
  surface: "#FFFFFF",
  light: "#EAF4ED",
  border: "#D9E5DC",
  muted: "#66756C",
  text: "#303B34",
  warning: "#98551A",
};

export default function Notices() {
  const { language } = usePortal();

  const isHindi = language === "hi";

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<FilterCategory>("All");
  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const tr = (en: string, hi: string): string =>
    isHindi ? hi : en;

  const filteredNotices = noticeBoardData
    .filter((notice) => {
      const searchText = [
        notice.title,
        notice.title_hi,
        notice.summary,
        notice.summary_hi,
        notice.officialRefNo,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(
        search.trim().toLowerCase()
      );

      const matchesCategory =
        category === "All" ||
        notice.category === category;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }

      return b.publishedDate.localeCompare(
        a.publishedDate
      );
    });

  async function openOfficialUrl(url?: string) {
    if (!url || !url.startsWith("https://")) {
      Alert.alert(
        tr("Link unavailable", "लिंक उपलब्ध नहीं"),
        tr(
          "A verified official link is not available.",
          "सत्यापित आधिकारिक लिंक उपलब्ध नहीं है।"
        )
      );
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        tr("Unable to open link", "लिंक नहीं खुल सका"),
        tr(
          "Check your internet connection and try again.",
          "इंटरनेट कनेक्शन जांचें और फिर कोशिश करें।"
        )
      );
    }
  }

  async function shareNotice(notice: NoticeRecord) {
    try {
      await Share.share({
        message: [
          isHindi ? notice.title_hi : notice.title,
          isHindi ? notice.summary_hi : notice.summary,
          tr(
            "Verification pending",
            "आधिकारिक सत्यापन बाकी है"
          ),
          notice.officialPortalUrl || "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      });
    } catch {
      Alert.alert(
        tr("Sharing failed", "शेयर नहीं हो सका")
      );
    }
  }

  function formatDate(value: string): string {
    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      isHindi ? "hi-IN" : "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>
        {tr("Important Notices", "जरूरी सूचनाएं")}
      </Text>

      <Text style={styles.subtitle}>
        {tr(
          "Agriculture updates and scheme information",
          "खेती और सरकारी योजनाओं से जुड़ी जानकारी"
        )}
      </Text>

      <View style={styles.searchBox}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={tr(
            "Search notices...",
            "सूचना खोजें..."
          )}
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((item) => {
          const selected = category === item.key;

          return (
            <Pressable
              key={item.key}
              onPress={() => setCategory(item.key)}
              style={[
                styles.filter,
                selected && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.activeFilterText,
                ]}
              >
                {isHindi ? item.hi : item.en}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.resultCount}>
        {tr(
          `${filteredNotices.length} notices`,
          `${filteredNotices.length} सूचनाएं`
        )}
      </Text>

      {filteredNotices.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📋</Text>

          <Text style={styles.emptyTitle}>
            {tr(
              "No notices found",
              "कोई सूचना नहीं मिली"
            )}
          </Text>

          <Text style={styles.emptyText}>
            {tr(
              "Try another category or search term.",
              "दूसरी श्रेणी या शब्द से खोजें।"
            )}
          </Text>
        </View>
      )}

      {filteredNotices.map((notice) => {
        const expanded = expandedId === notice.id;

        const title = isHindi
          ? notice.title_hi
          : notice.title;

        const summary = isHindi
          ? notice.summary_hi
          : notice.summary;

        const details = isHindi
          ? notice.fullDetails_hi
          : notice.fullDetails;

        const department = isHindi
          ? notice.department_hi
          : notice.department;

        const categoryLabel = FILTERS.find(
          (item) => item.key === notice.category
        );

        return (
          <View
            key={notice.id}
            style={styles.noticeCard}
          >
            <View style={styles.metaRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {categoryLabel
                    ? isHindi
                      ? categoryLabel.hi
                      : categoryLabel.en
                    : notice.category}
                </Text>
              </View>

              <Text style={styles.date}>
                {formatDate(notice.publishedDate)}
              </Text>
            </View>

            <View style={styles.statusRow}>
              {notice.isPinned && (
                <Text style={styles.pinned}>
                  {tr(
                    "📌 Pinned",
                    "📌 महत्वपूर्ण"
                  )}
                </Text>
              )}

              {notice.isUrgent && (
                <Text style={styles.urgent}>
                  {tr(
                    "⚠ Urgent",
                    "⚠ अति आवश्यक"
                  )}
                </Text>
              )}
            </View>

            <Text style={styles.noticeTitle}>
              {title}
            </Text>

            <Text style={styles.department}>
              {department}
            </Text>

            <Text
              style={styles.summary}
              numberOfLines={expanded ? undefined : 2}
            >
              {summary}
            </Text>

            {!notice.verified && (
              <Text style={styles.verification}>
                {tr(
                  "Verification pending — not an authenticated government notice",
                  "सत्यापन बाकी — यह प्रमाणित सरकारी सूचना नहीं है"
                )}
              </Text>
            )}

            {!!notice.officialRefNo && (
              <Text style={styles.reference}>
                {`${tr("Reference", "संदर्भ")}: ${notice.officialRefNo}`}
              </Text>
            )}

            {expanded && (
              <View style={styles.details}>
                <Text style={styles.detailsHeading}>
                  {tr(
                    "Complete Information",
                    "पूरी जानकारी"
                  )}
                </Text>

                <Text style={styles.detailsText}>
                  {details}
                </Text>
              </View>
            )}

            <Pressable
              style={styles.primaryButton}
              onPress={() =>
                setExpandedId(
                  expanded ? null : notice.id
                )
              }
            >
              <Text style={styles.primaryButtonText}>
                {expanded
                  ? tr("Hide Details", "विवरण बंद करें")
                  : tr(
                      "See Notice",
                      "पूरी सूचना देखें"
                    )}
              </Text>
            </Pressable>

            <View style={styles.actionRow}>
              {!!notice.officialPortalUrl && (
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() =>
                    openOfficialUrl(
                      notice.officialPortalUrl
                    )
                  }
                >
                  <Text style={styles.secondaryText}>
                    {tr(
                      "Official Portal",
                      "सरकारी पोर्टल"
                    )}
                  </Text>
                </Pressable>
              )}

              {notice.verified && !!notice.pdfUrl && (
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() =>
                    openOfficialUrl(notice.pdfUrl)
                  }
                >
                  <Text style={styles.secondaryText}>
                    {tr("View PDF", "पीडीएफ देखें")}
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={styles.secondaryButton}
                onPress={() => shareNotice(notice)}
              >
                <Text style={styles.secondaryText}>
                  {tr("Share", "साझा करें")}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 23,
    fontWeight: "700",
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 5,
    marginBottom: 18,
    lineHeight: 22,
  },
  searchBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 14,
  },
  searchInput: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: COLORS.text,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 12,
  },
  filter: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: COLORS.light,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: "flex-start",
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  resultCount: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: "center",
    marginTop: 12,
  },
  emptyIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  emptyTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 7,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  noticeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: COLORS.light,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 1,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  date: {
    color: COLORS.muted,
    fontSize: 12,
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  pinned: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  urgent: {
    fontSize: 12,
    color: "#A83C2B",
    fontWeight: "600",
  },
  noticeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.primary,
    lineHeight: 25,
    marginBottom: 8,
  },
  department: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 10,
  },
  summary: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  verification: {
    fontSize: 12,
    color: COLORS.warning,
    lineHeight: 18,
    marginBottom: 12,
  },
  reference: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 12,
  },
  details: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  detailsHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 7,
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 23,
    color: COLORS.text,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: COLORS.light,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});