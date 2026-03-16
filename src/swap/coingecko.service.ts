/**
 * Serviço de Integração com CoinGecko API
 * 
 * Obtém cotações de criptomoedas em tempo real.
 * Usa a API pública gratuita do CoinGecko.
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// Mapeamento de símbolos de criptomoedas para IDs do CoinGecko
const CURRENCY_MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  BNB: 'binancecoin',
  USDC: 'usd-coin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  SOL: 'solana',
  MATIC: 'matic-network',
  DOT: 'polkadot',
  LTC: 'litecoin',
};

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    this.apiUrl =
      this.configService.get<string>('COINGECKO_API_URL') ||
      'https://api.coingecko.com/api/v3';
  }

  /**
   * Obtém a cotação de uma criptomoeda em USD
   * 
   * @param currency - Símbolo da moeda (BTC, ETH, etc.)
   * @returns Preço em USD
   */
  async getPrice(currency: string): Promise<number> {
    const currencyUpper = currency.toUpperCase();
    const coinId = CURRENCY_MAP[currencyUpper];

    if (!coinId) {
      throw new BadRequestException(
        `Moeda não suportada: ${currency}. Moedas disponíveis: ${Object.keys(CURRENCY_MAP).join(', ')}`,
      );
    }

    try {
      // Chama a API do CoinGecko
      // Endpoint: /simple/price?ids=bitcoin&vs_currencies=usd
      const response = await axios.get(`${this.apiUrl}/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd',
        },
        timeout: 5000, // Timeout de 5 segundos
      });

      const price = response.data[coinId]?.usd;

      if (!price) {
        throw new Error('Preço não encontrado na resposta');
      }

      this.logger.log(`Preço obtido para ${currencyUpper}: $${price}`);

      return price;
    } catch (error) {
      this.logger.error(`Erro ao obter preço de ${currency}`, error.message);
      throw new BadRequestException(
        `Erro ao obter cotação de ${currency}. Tente novamente mais tarde.`,
      );
    }
  }

  /**
   * Calcula a taxa de conversão entre duas moedas
   * 
   * @param fromCurrency - Moeda de origem
   * @param toCurrency - Moeda de destino
   * @returns Taxa de conversão (quanto de toCurrency vale 1 fromCurrency)
   */
  async getConversionRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // Obtém os preços em USD de ambas as moedas
    const [fromPrice, toPrice] = await Promise.all([
      this.getPrice(fromCurrency),
      this.getPrice(toCurrency),
    ]);

    // Calcula a taxa de conversão
    // Exemplo: 1 BTC ($40000) = 20 ETH ($2000)
    // Taxa = 40000 / 2000 = 20
    const rate = fromPrice / toPrice;

    this.logger.log(
      `Taxa de conversão: 1 ${fromCurrency} = ${rate.toFixed(8)} ${toCurrency}`,
    );

    return rate;
  }

  /**
   * Retorna a lista de moedas suportadas
   */
  getSupportedCurrencies(): string[] {
    return Object.keys(CURRENCY_MAP);
  }
}
