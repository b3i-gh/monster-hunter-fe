import { Dimensions } from "react-native";

// Colors inspired by popular energy drink brands and their vibrant nature
export const colors = {
  primary: "#00FF00", // Energetic green
  secondary: "#1E1E1E", // Dark gray/black
  accent: "#FFFF00", // Electric yellow
  background: "#121212", // Dark background
  surface: "#1E1E1E", // Slightly lighter than background
  text: {
    primary: "#FFFFFF",
    secondary: "#B3B3B3",
    accent: "#00FF00", // Changed to match primary
  },
  status: {
    success: "#4CAF50",
    error: "#FF3B30",
    warning: "#FF9500",
  },
  gradients: {
    primary: ["#00FF00", "#00CC00"], // Changed to green gradient
    accent: ["#FFFF00", "#FFD700"],
  },
};

// Typography
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 16,
    color: colors.text.primary,
  },
  caption: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  button: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

// Common styles
export const commonStyles = {
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.m,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 7,
  },
  button: {
    primary: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.m,
      paddingHorizontal: spacing.l,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 8,
    },
    secondary: {
      backgroundColor: colors.surface,
      paddingVertical: spacing.m,
      paddingHorizontal: spacing.l,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.primary,
    },
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.m,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.text.secondary,
  },
  shadow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  gridItem: {
    flex: 1,
    margin: spacing.s,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  modal: {
    container: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.l,
      width: Dimensions.get("window").width * 0.9,
      maxHeight: Dimensions.get("window").height * 0.8,
    },
  },
};

// Layout
export const layout = {
  containerWidth: "90%",
  maxWidth: 960,
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
};

// Animation configurations
export const animations = {
  button: {
    scale: 0.98,
    duration: 100,
  },
  transition: {
    duration: 300,
  },
};

// Screen-specific styles
export const screenStyles = {
  canDetails: {
    safeArea: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: colors.background,
    },
    container: {
      ...commonStyles.screen,
    },
    detailsContainer: {
      ...commonStyles.card,
      marginBottom: spacing.l,
    },
    canName: {
      ...typography.h1,
      color: colors.primary,
      marginBottom: spacing.m,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.s,
    },
    detailLabel: {
      ...typography.body,
      color: colors.text.secondary,
      width: 80,
    },
    detailValue: {
      ...typography.body,
      color: colors.text.primary,
      flex: 1,
    },
    sugarFreeBadge: {
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.xs,
      borderRadius: 16,
      alignSelf: "flex-start",
      marginTop: spacing.s,
    },
    sugarFreeText: {
      ...typography.caption,
      color: colors.secondary,
      fontWeight: "bold",
    },
    dateContainer: {
      marginTop: spacing.m,
      borderTopWidth: 1,
      borderTopColor: colors.surface,
      paddingTop: spacing.m,
    },
    dateLabel: {
      ...typography.caption,
      marginBottom: spacing.xs,
    },
    photosSection: {
      flex: 1,
    },
    sectionTitle: {
      ...typography.h2,
      marginBottom: spacing.m,
    },
    photoGrid: {
      padding: spacing.xs,
    },
    photoContainer: {
      ...commonStyles.gridItem,
      ...commonStyles.shadow,
    },
    photo: {
      width: "100%",
      height: "100%",
      borderRadius: 12,
    },
    addButton: {
      ...commonStyles.button.primary,
      marginVertical: spacing.m,
    },
    disabledButton: {
      opacity: 0.5,
    },
    addButtonText: {
      ...typography.button,
      color: colors.text.primary,
    },
    modalOverlay: {
      ...commonStyles.modal.container,
    },
    enlargedPhoto: {
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  },
  addCan: {
    safeArea: {
      flex: 1,
      paddingTop: 40,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: spacing.l,
    },
    label: {
      ...typography.body,
      marginBottom: spacing.s,
    },
    input: {
      ...commonStyles.input,
      marginBottom: spacing.l,
    },
    picker: {
      color: colors.text.primary,
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.l,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: colors.status.success,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.status.success,
    },
    checkboxText: {
      color: colors.text.primary,
      marginLeft: spacing.s,
    },
    checkboxChecked: {
      backgroundColor: colors.status.success,
    },
    checkboxUnchecked: {
      backgroundColor: colors.background,
    },
    checkboxCheckmark: {
      color: colors.text.primary,
    },
  },
  canList: {
    safeArea: {
      flex: 1,
      paddingTop: 40,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      alignItems: "center",
    },
    title: {
      ...typography.h1,
      marginBottom: spacing.l,
    },
    version: {
      ...typography.caption,
      marginLeft: spacing.xs,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderColor: colors.text.secondary,
      borderWidth: 1,
      margin: spacing.m,
      paddingLeft: spacing.m,
      width: "80%",
      borderRadius: 8,
    },
    searchInput: {
      flex: 1,
      height: 40,
      color: colors.text.primary,
    },
    clearButton: {
      padding: spacing.s,
    },
    clearButtonText: {
      color: colors.primary,
    },
    apiSection: {
      marginTop: spacing.xl,
      width: "80%",
      flex: 1,
      alignItems: "center",
    },
    apiUrl: {
      ...typography.body,
      marginBottom: spacing.s,
    },
    apiInput: {
      flexDirection: "row",
      borderColor: colors.text.secondary,
      borderWidth: 1,
      margin: spacing.m,
      paddingLeft: spacing.m,
      width: "100%",
      borderRadius: 8,
      color: colors.text.primary,
    },
    actionButton: {
      ...commonStyles.button.primary,
      marginVertical: spacing.m,
      width: "80%",
    },
    actionButtonText: {
      ...typography.button,
      color: colors.text.primary,
    },
    listContainer: {
      width: "100%",
    },
    countText: {
      ...typography.body,
      marginBottom: spacing.s,
    },
    offlineText: {
      ...typography.body,
      color: colors.status.error,
      marginBottom: spacing.s,
    },
    loadingIndicator: {
      marginVertical: spacing.l,
    },
  },
  swipeableItem: {
    container: {
      ...commonStyles.card,
      margin: spacing.s,
      backgroundColor: colors.surface,
      borderLeftWidth: 4,
      padding: spacing.m,
    },
    leftBorder: (sugarFree) => ({
      borderLeftColor: sugarFree ? colors.accent : colors.primary,
    }),
    title: {
      ...typography.h2,
      color: colors.primary,
      marginBottom: spacing.m,
      width: "100%",
    },
    contentRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    contentContainer: {
      flex: 1,
      marginRight: spacing.m,
    },
    detailText: {
      ...typography.body,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    sugarFreeBadge: {
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.s,
      paddingVertical: spacing.xs,
      borderRadius: 8,
      alignSelf: "flex-start",
      marginTop: spacing.xs,
    },
    sugarFreeText: {
      ...typography.caption,
      color: colors.background,
      fontWeight: "bold",
    },
    dateText: {
      ...typography.caption,
      color: colors.text.secondary,
    },
    thumbnailContainer: {
      width: 100,
      height: 100,
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },
    thumbnail: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    deleteButton: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.status.error,
      width: 80,
    },
    deleteButtonText: {
      color: colors.text.primary,
      fontWeight: "bold",
    },
  },
};
