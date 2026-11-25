export type PanelDevice = "desktop" | "tablet" | "mobile";

export const panelConfigByDevice = {
  desktop: {
    leftPanel: {
      defaultSize: "20%",
      minSize: 200,
      maxSize: "28%",
      collapsible: true,
      collapsedSize: 0,
    },
    centreLayout: {
      minSize: 420,
      maxSize: "70%",
      collapsible: false,
    },
    rightPanel: {
      defaultSize: "25%",
      minSize: 320,
      maxSize: "40%",
      collapsible: true,
      collapsedSize: 0,
    },
  },
  tablet: {
    leftPanel: {
      defaultSize: "22%",
      minSize: 200,
      maxSize: "30%",
      collapsible: true,
      collapsedSize: 0,
    },
    centreLayout: {
      minSize: 420,
      maxSize: "65%",
      collapsible: false,
    },
    rightPanel: {
      defaultSize: "28%",
      minSize: 280,
      maxSize: "35%",
      collapsible: true,
      collapsedSize: 0,
    },
  },
  mobile: {
    leftPanel: {
      defaultSize: "0%",
      minSize: 0,
      maxSize: "0%",
      collapsible: false,
      collapsedSize: 0,
    },
    centreLayout: {
      defaultSize: "100%",
      minSize: 0,
      maxSize: "100%",
      collapsible: false,
      collapsedSize: 0,
    },
    rightPanel: {
      defaultSize: "0%",
      minSize: 0,
      maxSize: "0%",
      collapsible: false,
      collapsedSize: 0,
    },
  },
} as const;

export const percentOf = (size?: `${number}%`) =>
  size ? Number.parseFloat(size) : 0;
