
# Contributing

If you want to contribute to the development of this Add-On, please refer to the information below:

## Prerequisites

- [regolith](https://github.com/Bedrock-OSS/regolith/releases) (follow the [installation guide](https://regolith-docs.readthedocs.io/en/latest/introduction/installation/)).
- [Node.js](https://nodejs.org/en/download/)
- [Python](https://www.python.org/downloads/)
- [Visual Studio Code](https://code.visualstudio.com/) or any IDE you want
    - [regolith extension](https://marketplace.visualstudio.com/items?itemName=BedrockOSS.regolith)

## Initial setup

1. Clone the repository and open it in your preferred IDE.
2. Run `regolith install-all` once to download filter dependencies.

## File naming convention

Please follow the standard naming convention below for readability and cleanliness:

| File name         | Description                         |
| ----------------- | ----------------------------------- |
| `*.b.json`        | Block definition                    |
| `*.se.json`       | Server entity (BP/entity)           |
| `*.ce.json`       | Client entity (RP/entity)           |
| `*.i.json`        | Item definition                     |
| `*.r.json`        | Recipe                              |
| `*.rp_ac.json`    | Resource Pack animation controllers |
| `*.bp_ac.json`    | Behavior Pack animation controllers |
| `*.rp_a.json`     | Resource Pack animations            |
| `*.bp_a.json`     | Behavior Pack animations            |
| `*.geo.json`      | Geometry file                       |
| `*.particle.json` | Particle definition file            |
| `*.rc.json`       | Render controller                   |
| `*.ui.json`       | JSON UI file                        |
