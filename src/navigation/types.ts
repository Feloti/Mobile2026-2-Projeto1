export type TabParamList = {
  Inicio: undefined;
  Colecao: undefined;
  Explorar: undefined;
  Feed: undefined;
  Mapa: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  InsectDetail: { speciesId: string };
  Camera: undefined;
  IdentificationResult: { photoUri?: string };
  ShareDiscovery: { speciesId: string; photoUri?: string };
};
