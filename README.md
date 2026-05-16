# 🤖 Crypto Guardian 🤖

Crypto Guardian validation API, employed in scenarios where users seek to ascertain the optimal timing for purchasing Ethereum cryptocurrency. Users input their desired minimum and maximum values, and the API verifies whether the provided value range is suitable for the purchase of the crypto or not.

## Crypto Guardian Documentation

#### Returns the bid value

```http
  GET /api/v1/transaction
```

| Return     | Type     | Description                                    |
| :--------- | :------- | :--------------------------------------------- |
| `bidValue` | `string` | The current purchase value of Ethereum in BRL. |

#### Validate a transaction

```http
  POST /api/v1/validate-transaction
```

| Param           | Type     | Description                                                                                                   |
| :-------------- | :------- | :------------------------------------------------------------------------------------------------------------ |
| `rangeBidValue` | `string` | **Mandatory**. The financial range offered by the company for the operation, for example: $10,000 to $15,000. |

## Author

- [@marcelldac](https://www.github.com/marcelldac)
