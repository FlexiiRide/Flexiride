export const mockUsers = [
  {
    "id": "u_1",
    "name": "Alice Owner",
    "email": "owner@example.com",
    "phone": "+94123456789",
    "role": "owner",
    "avatarUrl": "https://picsum.photos/seed/u1/100/100",
    "passwordHash": "password123"
  },
  {
    "id": "u_2",
    "name": "Bob Client",
    "email": "client@example.com",
    "phone": "+94987654321",
    "role": "client",
    "avatarUrl": "https://picsum.photos/seed/u2/100/100",
    "passwordHash": "password123"
  },
  {
    "id": "u_3",
    "name": "Charlie Owner",
    "email": "charlie@example.com",
    "phone": "+94112233445",
    "role": "owner",
    "avatarUrl": "https://picsum.photos/seed/u3/100/100",
    "passwordHash": "password123"
  },
  {
    "id": "u_4",
    "name": "Diana Client",
    "email": "diana@example.com",
    "phone": "+94556677889",
    "role": "client",
    "avatarUrl": "https://picsum.photos/seed/u4/100/100",
    "passwordHash": "password123"
  }
];

export const mockVehicles = [
  {
    "id": "v_100",
    "ownerId": "u_1",
    "title": "Toyota Prius 2019",
    "type": "car",
    "pricePerHour": 6.5,
    "pricePerDay": 45,
    "images": [
      "https://picsum.photos/seed/v100a/1200/800",
      "https://picsum.photos/seed/v100b/1200/800",
      "https://picsum.photos/seed/v100c/1200/800"
    ],
    "location": {
      "address": "Colombo 7, Sri Lanka",
      "lat": 6.9149,
      "lng": 79.8615
    },
    "availableRanges": [
      {
        "from": "2025-09-22T09:00:00.000Z",
        "to": "2025-09-26T17:00:00.000Z"
      }
    ],
    "description": "Clean hybrid, non-smoking, AC. Perfect for city driving and long trips. Excellent fuel economy.",
    "status": "active"
  },
  {
    "id": "v_101",
    "ownerId": "u_3",
    "title": "Honda Activa 2020",
    "type": "bike",
    "pricePerHour": 2.5,
    "pricePerDay": 15,
    "images": [
      "https://picsum.photos/seed/v101a/1200/800",
      "https://picsum.photos/seed/v101b/1200/800"
    ],
    "location": {
      "address": "Colombo 5, Sri Lanka",
      "lat": 6.8836,
      "lng": 79.8584
    },
    "availableRanges": [
      {
        "from": "2025-09-20T08:00:00.000Z",
        "to": "2025-09-30T20:00:00.000Z"
      }
    ],
    "description": "A reliable and zippy scooter, ideal for navigating through city traffic. Comes with two helmets.",
    "status": "active"
  },
  {
    "id": "v_102",
    "ownerId": "u_1",
    "title": "Nissan Sunny 2017",
    "type": "car",
    "pricePerHour": 5,
    "pricePerDay": 35,
    "images": [
      "https://picsum.photos/seed/v102a/1200/800"
    ],
    "location": {
      "address": "Dehiwala, Sri Lanka",
      "lat": 6.8511,
      "lng": 79.8655
    },
    "availableRanges": [
      {
        "from": "2025-09-20T00:00:00.000Z",
        "to": "2025-09-21T23:59:59.000Z"
      },
      {
        "from": "2025-09-27T00:00:00.000Z",
        "to": "2025-09-28T23:59:59.000Z"
      }
    ],
    "description": "Spacious and comfortable sedan. Great for families. Available on weekends only.",
    "status": "active"
  },
  {
    "id": "v_103",
    "ownerId": "u_3",
    "title": "Bajaj Pulsar 150",
    "type": "bike",
    "pricePerHour": 3,
    "pricePerDay": 20,
    "images": [
      "https://picsum.photos/seed/v103a/1200/800",
      "https://picsum.photos/seed/v103b/1200/800"
    ],
    "location": {
      "address": "Galle, Sri Lanka",
      "lat": 6.0329,
      "lng": 80.217
    },
    "availableRanges": [
      {
        "from": "2025-09-20T08:00:00.000Z",
        "to": "2025-10-20T20:00:00.000Z"
      }
    ],
    "description": "Sporty and powerful bike for an exciting ride along the coast. Well-maintained.",
    "status": "active"
  },
  {
    "id": "v_104",
    "ownerId": "u_1",
    "title": "Suzuki Wagon R",
    "type": "car",
    "pricePerHour": 4,
    "pricePerDay": 30,
    "images": [
      "https://picsum.photos/seed/v104a/1200/800"
    ],
    "location": {
      "address": "Kandy, Sri Lanka",
      "lat": 7.2906,
      "lng": 80.6337
    },
    "availableRanges": [
      {
        "from": "2025-09-15T09:00:00.000Z",
        "to": "2025-10-15T17:00:00.000Z"
      }
    ],
    "description": "Compact and easy to park. The perfect companion for exploring the hill country.",
    "status": "active"
  },
  {
    "id": "v_105",
    "ownerId": "u_3",
    "title": "Vespa Primavera",
    "type": "bike",
    "pricePerHour": 4.5,
    "pricePerDay": 30,
    "images": [
      "https://picsum.photos/seed/v105a/1200/800"
    ],
    "location": {
      "address": "Colombo 7, Sri Lanka",
      "lat": 6.9149,
      "lng": 79.8615
    },
    "availableRanges": [
      {
        "from": "2025-09-20T08:00:00.000Z",
        "to": "2025-09-30T20:00:00.000Z"
      }
    ],
    "description": "Ride in style with this classic Italian scooter. A head-turner for sure.",
    "status": "inactive"
  }
];

export const mockBookings = [
  {
    "id": "b_1",
    "vehicleId": "v_100",
    "clientId": "u_2",
    "ownerId": "u_1",
    "from": "2025-09-22T09:00:00.000Z",
    "to": "2025-09-22T15:00:00.000Z",
    "totalPrice": 39.0,
    "status": "approved",
    "paymentMethod": "cash",
    "pickupDetails": "Meet at parking spot A"
  },
  {
    "id": "b_2",
    "vehicleId": "v_101",
    "clientId": "u_4",
    "ownerId": "u_3",
    "from": "2025-09-21T10:00:00.000Z",
    "to": "2025-09-21T18:00:00.000Z",
    "totalPrice": 20.0,
    "status": "requested",
    "paymentMethod": "cash",
    "pickupDetails": ""
  },
  {
    "id": "b_3",
    "vehicleId": "v_102",
    "clientId": "u_2",
    "ownerId": "u_1",
    "from": "2025-09-27T10:00:00.000Z",
    "to": "2025-09-28T18:00:00.000Z",
    "totalPrice": 70.0,
    "status": "rejected",
    "paymentMethod": "cash",
    "pickupDetails": ""
  },
  {
    "id": "b_4",
    "vehicleId": "v_100",
    "clientId": "u_4",
    "ownerId": "u_1",
    "from": "2025-09-25T11:00:00.000Z",
    "to": "2025-09-25T13:00:00.000Z",
    "totalPrice": 13.0,
    "status": "cancelled",
    "paymentMethod": "cash",
    "pickupDetails": ""
  }
];
