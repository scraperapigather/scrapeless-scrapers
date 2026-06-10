# Google Flights data model

Single source of truth for the `scraper.google.flights` response shape. Field names and sample values mirror a live round-trip run (`LHR → JFK`, outbound `2026-06-20`, return `2026-06-27`, `type: "1"`) captured in [`api/results/flights.json`](api/results/flights.json).

The actor is **synchronous**: the `POST /api/v1/scraper/request` body **is** the parsed object below — no polling.

## Top level

| Field            | Type   | Notes                                                          |
| ---------------- | ------ | -------------------------------------------------------------- |
| `flights_result` | object | The parsed flights payload (see below)                         |
| `metadata`       | object | Scrapeless envelope: `engine` (`google.flights`) + `rawUrl` (stored raw JSON copy) |

## `flights_result`

| Field            | Type      | Notes                                                       |
| ---------------- | --------- | ----------------------------------------------------------- |
| `best_flights`   | object[]  | Google's "Best" ranked itineraries (4 in the sample)        |
| `other_flights`  | object[]  | Remaining itineraries (21 in the sample)                    |
| `price_insights` | object    | Lowest price, typical range, price level, price history     |
| `airports`       | object[]  | Per-leg departure/arrival airport metadata (2 legs round trip) |

### Flight option — each entry in `best_flights` / `other_flights`

| Field              | Type     | Required | Notes                                                                  |
| ------------------ | -------- | -------- | ---------------------------------------------------------------------- |
| `flights`          | object[] | yes      | One entry per leg/segment (see *Leg* below)                            |
| `layovers`         | object[] | no       | Layover stops; **`null` for direct flights**                           |
| `total_duration`   | int      | yes      | Total itinerary duration in minutes                                    |
| `carbon_emissions` | object   | yes      | `this_flight`, `typical_for_this_route` (grams), `difference_percent`  |
| `price`            | int      | yes      | Total price in the response currency (USD in the sample)               |
| `type`             | string   | no       | Itinerary type label; empty string `""` in the sample                  |
| `airline_logo`     | string   | no       | Logo URL for the primary carrier                                       |
| `extensions`       | string[] | no       | Option-level extension labels; `null` in the sample                    |
| `departure_token`  | string   | no       | Opaque base64 continuation token (used to fetch return legs) — **trimmed** in the fixture |

### Leg — each entry in `flights[]`

| Field                          | Type     | Required | Notes                                                          |
| ------------------------------ | -------- | -------- | -------------------------------------------------------------- |
| `departure_airport`            | object   | yes      | `{ name, id (IATA), time ("YYYY-MM-DD H:MM") }`                |
| `arrival_airport`              | object   | yes      | `{ name, id (IATA), time }`                                    |
| `duration`                     | int      | yes      | Segment duration in minutes                                    |
| `airplane`                     | string   | no       | Aircraft type (e.g. `Airbus A321neo`)                          |
| `airline`                      | string   | yes      | Operating carrier                                              |
| `airline_logo`                 | string   | no       | Carrier logo URL                                               |
| `travel_class`                 | string   | no       | Cabin class; empty string `""` in the sample                  |
| `flight_number`                | string   | yes      | e.g. `B6 1621`                                                 |
| `extensions`                   | string[] | no       | Amenity labels (legroom, power, Wi-Fi, emissions estimate, …) |
| `ticket_also_sold_by`          | string[] | no       | Other sellers; `null` in the sample                           |
| `legroom`                      | string   | no       | e.g. `32 in`                                                   |
| `overnight`                    | bool     | no       | Whether the segment is overnight                              |
| `often_delayed_by_over_30_min` | bool     | no       | Frequent-delay flag                                           |

### Layover — each entry in `layovers[]`

| Field       | Type   | Notes                              |
| ----------- | ------ | ---------------------------------- |
| `duration`  | int    | Layover length in minutes          |
| `name`      | string | Layover airport name               |
| `id`        | string | Layover airport IATA code          |
| `overnight` | bool   | Whether the layover is overnight   |

### `price_insights`

| Field                 | Type        | Notes                                                                     |
| --------------------- | ----------- | ------------------------------------------------------------------------- |
| `lowest_price`        | int         | Lowest price seen for the route                                           |
| `price_level`         | string      | e.g. `normal`, `low`, `high`                                              |
| `typical_price_range` | [int, int]  | `[low, high]` typical price band                                          |
| `price_history`       | array[][]   | Series of `[unix_timestamp, price]` pairs — **trimmed** in the fixture    |

### `airports`

One object per leg, each with `departure[]` and `arrival[]` arrays of:

| Field          | Type   | Notes                                            |
| -------------- | ------ | ------------------------------------------------ |
| `airport`      | object | `{ id (IATA), name }`                            |
| `city`         | string | City name                                        |
| `country`      | string | Country name                                     |
| `country_ode`  | string | Two-letter country code (actor spelling — note the `country_ode` key, not `country_code`) |
| `image`        | string | City/airport image URL                           |
| `thumbnail`    | string | Thumbnail image URL                              |

## Trimmed fields in the fixture

[`api/results/flights.json`](api/results/flights.json) is a **real capture**, with heavy fields trimmed for readability (the live `POST` returns the full payload):

- `departure_token` — each ~280-char base64 string shortened to a prefix + a `<trimmed: …>` marker.
- `other_flights` — cut from **21** entries to **2** (`best_flights` is kept in full at **4**).
- `price_insights.price_history` — cut from **61** `[timestamp, price]` points to **6**.

A top-level `_note` in the fixture records the same trims.
