import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const REGION = "us-east-1"; // Change this to your region
const client = new DynamoDBClient({ region: REGION });

const productsData = [
  {
    id: uuidv4(),
    title: "Product 1",
    description: "Description for product 1",
    price: 100,
  },
  {
    id: uuidv4(),
    title: "Product 2",
    description: "Description for product 2",
    price: 200,
  },
  {
    id: uuidv4(),
    title: "Product 3",
    description: "Description for product 3",
    price: 300,
  },
];

const populateTables = async () => {
  for (const product of productsData) {
    const productParams = {
      TableName: "products",
      Item: {
        id: { S: product.id },
        title: { S: product.title },
        description: { S: product.description },
        price: { N: product.price.toString() },
      },
    };

    const stockParams = {
      TableName: "stocks",
      Item: {
        product_id: { S: product.id },
        count: { N: "10" }, // Example stock count
      },
    };

    try {
      await client.send(new PutItemCommand(productParams));
      await client.send(new PutItemCommand(stockParams));
      console.log(`Successfully inserted ${product.title}`);
    } catch (err) {
      console.error("Error inserting item: ", err);
    }
  }
};

populateTables().then(() => console.log("Tables populated successfully."));
