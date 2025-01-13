import { Height } from "@mui/icons-material";
import {createTheme} from "@mui/material";

const mainTheme = createTheme({
        palette: {
            primary: {
                main: "#1b4596",
            },
            secondary: {
                main: "rgb(34, 139, 230)"
            },
        },
        typography: {
            fontFamily: "Nunito Sans, sans-serif",
            subtitle2: {
                fontSize: "16px",
                fontStyle: "normal",
                fontWeight: "300",
                lineHeight: "30px",
                color: "#0D0D15",
            },
            caption: {
                fontStyle: "normal",
                fontWeight: "200",
                fontSize: "12px",
                lineHeight: "20px",
                color: "#293540",
            },
            body1: {
                fontWeight: "400",
                borderRadius: 7,
            },
            body2: {
                fontWeight: "400",
                fontSize: "16px",
            },
        },
        components: {
            MuiSlider: {
              defaultProps: {
                  color: "secondary",
                  sx: {
                      '& .MuiSlider-thumb': {
                      },
                  }
              }
            },
            MuiButton: {
                defaultProps: {
                    style: {
                        textTransform: "none"
                    }
                }
            },
            MuiTypography: {
                defaultProps: {
                    alignSelf: "center",
                    sx: {
                        cursor: 'default',
                    },
                }
            },
            MuiSelect: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                        },
                        '& .MuiInputBase-input': {
                            padding: '13px 16px 13px 16px',
                        },
                        '& .MuiInputLabel-outlined': {
                            transform: 'translate(14px, 14px) scale(1)',
                        },
                        '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',
                        },
                    },
                },
                defaultProps: {
                    color: "secondary",
                    size: "small",
                    style: {
                        height: "min-content",
                        borderRadius: '12px',
                    },
                }
            },
            MuiAutocomplete: {
                defaultProps: {
                    style: {
                        alignSelf: "center"
                    }
                }
            },
            MuiCard: {
                defaultProps: {
                    style: {
                        borderRadius: '20px',
                    },
                },
            },
            MuiAccordion: {
                defaultProps: {
                    style: {
                        borderRadius: '15px',
                        boxShadow: '0 0 4px rgba(0,0,0,0.25)',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                        },
                        '& .MuiInputBase-input': {
                            padding: '13px 16px 13px 16px',
                        },
                        '& .MuiInputLabel-outlined': {
                            transform: 'translate(14px, 14px) scale(1)',
                        },
                        '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -6px) scale(0.75)',
                        },
                    },
                },
            },
        }
    })
;

export default mainTheme;