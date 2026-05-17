export const typography = {
  display: {
    xl: { fontFamily: 'BebasNeue_400Regular', fontSize: 48, letterSpacing: 4 },
    lg: { fontFamily: 'BebasNeue_400Regular', fontSize: 32, letterSpacing: 3 },
    md: { fontFamily: 'BebasNeue_400Regular', fontSize: 24, letterSpacing: 2 },
  },
  body: {
    xl: { fontFamily: 'DMSans_700Bold', fontSize: 18, lineHeight: 26 },
    lg: { fontFamily: 'DMSans_500Medium', fontSize: 16, lineHeight: 24 },
    md: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 21 },
    sm: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 18 },
  },
  mono: {
    md: { fontFamily: 'DMMono_500Medium', fontSize: 13, letterSpacing: 0.5 },
    sm: { fontFamily: 'DMMono_400Regular', fontSize: 11, letterSpacing: 1 },
  },
  label: {
    md: {
      fontFamily: 'DMMono_500Medium',
      fontSize: 11,
      letterSpacing: 2,
      textTransform: 'uppercase' as const,
    },
    sm: {
      fontFamily: 'DMMono_400Regular',
      fontSize: 10,
      letterSpacing: 1.5,
      textTransform: 'uppercase' as const,
    },
  },
};
