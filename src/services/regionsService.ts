export type MacroRegionId = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';
export interface MacroRegion {
    id: MacroRegionId;
    name: string;
}
export const MACRO_REGIONS: MacroRegion[] = [
    { id: 'norte', name: 'Norte' },
    { id: 'nordeste', name: 'Nordeste' },
    { id: 'centro-oeste', name: 'Centro-Oeste' },
    { id: 'sudeste', name: 'Sudeste' },
    { id: 'sul', name: 'Sul' },
];
export type StateRegionId =
    | 'acre'
    | 'alagoas'
    | 'amapa'
    | 'amazonas'
    | 'bahia'
    | 'ceara'
    | 'distrito-federal'
    | 'espirito-santo'
    | 'goias'
    | 'maranhao'
    | 'mato-grosso'
    | 'mato-grosso-do-sul'
    | 'minas-gerais'
    | 'para'
    | 'paraiba'
    | 'parana'
    | 'pernambuco'
    | 'piaui'
    | 'rio-de-janeiro'
    | 'rio-grande-do-norte'
    | 'rio-grande-do-sul'
    | 'rondonia'
    | 'roraima'
    | 'santa-catarina'
    | 'sao-paulo'
    | 'sergipe'
    | 'tocantins';
export type RegionId = 'brasil' | StateRegionId;
export interface Region {
    id: RegionId;
    name: string;
}
export interface StateRegion extends Region {
    id: StateRegionId;
    uf: string;
    macro: MacroRegionId;
}
export const STATES: StateRegion[] = [
    { id: 'acre', name: 'Acre', uf: 'AC', macro: 'norte' },
    { id: 'alagoas', name: 'Alagoas', uf: 'AL', macro: 'nordeste' },
    { id: 'amapa', name: 'Amapá', uf: 'AP', macro: 'norte' },
    { id: 'amazonas', name: 'Amazonas', uf: 'AM', macro: 'norte' },
    { id: 'bahia', name: 'Bahia', uf: 'BA', macro: 'nordeste' },
    { id: 'ceara', name: 'Ceará', uf: 'CE', macro: 'nordeste' },
    { id: 'distrito-federal', name: 'Distrito Federal', uf: 'DF', macro: 'centro-oeste' },
    { id: 'espirito-santo', name: 'Espírito Santo', uf: 'ES', macro: 'sudeste' },
    { id: 'goias', name: 'Goiás', uf: 'GO', macro: 'centro-oeste' },
    { id: 'maranhao', name: 'Maranhão', uf: 'MA', macro: 'nordeste' },
    { id: 'mato-grosso', name: 'Mato Grosso', uf: 'MT', macro: 'centro-oeste' },
    { id: 'mato-grosso-do-sul', name: 'Mato Grosso do Sul', uf: 'MS', macro: 'centro-oeste' },
    { id: 'minas-gerais', name: 'Minas Gerais', uf: 'MG', macro: 'sudeste' },
    { id: 'para', name: 'Pará', uf: 'PA', macro: 'norte' },
    { id: 'paraiba', name: 'Paraíba', uf: 'PB', macro: 'nordeste' },
    { id: 'parana', name: 'Paraná', uf: 'PR', macro: 'sul' },
    { id: 'pernambuco', name: 'Pernambuco', uf: 'PE', macro: 'nordeste' },
    { id: 'piaui', name: 'Piauí', uf: 'PI', macro: 'nordeste' },
    { id: 'rio-de-janeiro', name: 'Rio de Janeiro', uf: 'RJ', macro: 'sudeste' },
    { id: 'rio-grande-do-norte', name: 'Rio Grande do Norte', uf: 'RN', macro: 'nordeste' },
    { id: 'rio-grande-do-sul', name: 'Rio Grande do Sul', uf: 'RS', macro: 'sul' },
    { id: 'rondonia', name: 'Rondônia', uf: 'RO', macro: 'norte' },
    { id: 'roraima', name: 'Roraima', uf: 'RR', macro: 'norte' },
    { id: 'santa-catarina', name: 'Santa Catarina', uf: 'SC', macro: 'sul' },
    { id: 'sao-paulo', name: 'São Paulo', uf: 'SP', macro: 'sudeste' },
    { id: 'sergipe', name: 'Sergipe', uf: 'SE', macro: 'nordeste' },
    { id: 'tocantins', name: 'Tocantins', uf: 'TO', macro: 'norte' },
];
export const BRAZIL: Region = { id: 'brasil', name: 'Brasil' };
export const REGIONS: Region[] = [BRAZIL, ...STATES];
export function getRegionName(id: RegionId): string {
    const region = REGIONS.find((r) => r.id === id);
    return region ? region.name : id;
}
export function getStatesByMacro(macro: MacroRegionId): StateRegion[] {
    return STATES.filter((state) => state.macro === macro);
}
export function getStateByUf(uf: string | null | undefined): StateRegion | undefined {
    return STATES.find((state) => state.uf === uf);
}
