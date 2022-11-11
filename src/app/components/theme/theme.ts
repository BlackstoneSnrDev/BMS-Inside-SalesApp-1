export interface Theme {
  name: string;
  properties: any;
}

export const light: Theme = {
  name: 'light',
  properties: {
    '--bg-color': '#e6e7ee',
    '--bg-hover-color': '#e0e1e9',
    '--bg-hover-transparent-color': '#26283308',
    '--bg-transparent': '#00000000',

    '--txt-color': '#44476a',
    '--txt-secondary-color': '#333333',
    '--txt-label-color': '#5c5c5f',

    '--border-color': '#d1d9e6',

    '--box-shadow-inset': '#b8b9be',
    '--box-shadow-inset-secondary': '#fff',
    '--pulse-animation-color': '#8d90b5b3',

    '--success-color': '#296e58',
    '--error-color': '#a91e2c',
    '--error-hover-color': '#c42131',

    '--overlay-color': '#e6e7eea2',

    '--toggle-bg-color': '#b1bcce',
    '--toggle-slide-bg-color': '#b1bccec9',
    '--toggle-slide-hover-bg-color': '#44476ad8',

    '--bg-scrollbar': '#b8b9be80',
    '--bg-scrollbar-hover': '#cfcfd6',
  },
};

export const dark: Theme = {
  name: 'dark',
  properties: {
    '--bg-color': '#2d2d3c',
    '--bg-hover-color': '#38384a',
    '--bg-hover-transparent-color': '#38384a47',
    '--bg-transparent': '#00000000',

    '--txt-color': '#aca6cc',
    '--txt-secondary-color': '#d9d2ff',
    '--txt-label-color': '#918f9d',

    '--border-color': '#3d3d54',

    '--box-shadow-inset': '#232331',
    '--box-shadow-inset-secondary': '#2a2a3a',
    '--pulse-animation-color': '#8d90b5b3',

    '--success-color': '#39d789',
    '--error-color': '#ff4b5d',
    '--error-hover-color': '#c42131',

    '--overlay-color': '#313344a2',

    '--toggle-bg-color': '#b1bcce',
    '--toggle-slide-bg-color': '#b1bccec9',
    '--toggle-slide-hover-bg-color': '#44476ad8',

    '--bg-scrollbar': '#b8b9be80',
    '--bg-scrollbar-hover': '#cfcfd6',
  },
};
