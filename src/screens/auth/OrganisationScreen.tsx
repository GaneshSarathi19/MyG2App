import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors, Fonts} from '../../theme';
import AppScreen from '../../components/layout/AppScreen';
import {useAppDispatch} from '../../redux/hooks';
import {selectOrganisation, Organisation} from '../../redux/slices/organisationSlice';

type AuthParamList = {
  Organisation: undefined;
  Login: undefined;
};

const G2_LOGO = require('../../resources/g2logo-small.png') as number;
const CG_VAK_LOGO = require('../../resources/cgvaklogo-small.png') as number;
const ORGANISATIONS: {
  key: Organisation;
  name: string;
  image?: any;
  initials: string;
}[] = [
  {
    key: 'G2',
    name: 'G2 Technology Solutions India Pvt Ltd.',
    image: G2_LOGO,
    initials: 'G2',
  },
  {
    key: 'CG-Vak',
    name: 'CG-Vak Software & Exports Ltd.',
    image: CG_VAK_LOGO,
    initials: 'CG',
  },
];

const OrganisationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthParamList>>();
  const dispatch = useAppDispatch();

  const handleSelect = (org: Organisation) => {
    dispatch(selectOrganisation(org));
    navigation.navigate('Login');
  };

  return (
    <AppScreen>
      <View style={styles.container}>
        <View style={styles.cardContainer}>
          <View style={styles.banner}>
            <View style={styles.bannerAccent} />
          </View>

          <Text style={styles.heading}>Choose your Organisation</Text>

          <View style={styles.cardRow}>
            {ORGANISATIONS.map(org => (
              <TouchableOpacity
                key={org.key}
                style={styles.orgCard}
                activeOpacity={0.8}
                onPress={() => handleSelect(org.key)}
              >
                <View style={styles.logoBox}>
                  {org.image ? (
                    <Image
                      source={org.image}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.logoPlaceholder}>{org.initials}</Text>
                  )}
                </View>
                <Text style={styles.orgName}>{org.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
  },

  banner: {
    height: 6,
    backgroundColor: Colors.primary,
    marginHorizontal: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 32,
  },
  bannerAccent: {
    width: '33%',
    height: '100%',
    backgroundColor: Colors.accent,
  },

  heading: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 28,
  },

  cardContainer: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },

  orgCard: {
    flex: 1,
    maxWidth: 160,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.background,
    paddingVertical: 20,
    paddingHorizontal: 12,
  },

  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  logoImage: {
    width: 60,
    height: 60,
  },

  logoPlaceholder: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },

  orgName: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OrganisationScreen;
