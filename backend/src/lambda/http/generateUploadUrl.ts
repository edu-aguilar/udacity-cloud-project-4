import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDB, S3 } from 'aws-sdk'
import { v4 as generateRandomUUID } from "uuid";
import { getUserId } from '../utils'

const docClient = new DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.TODOS_IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
const s3 = new S3({
  signatureVersion: 'v4' // Use Sigv4 algorithm
})

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId: string = getUserId(event)

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

  const result = await docClient.query({
    TableName : todosTable,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
        ':todoId': todoId
    }
  }).promise()

  console.log('result: ', result.Items);

  if (result.Count !== 0) {
    
    const imageId = generateRandomUUID()
    const signedUrl = s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: imageId,
      Expires: urlExpiration
    })

    const imgUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`

    await docClient.put({
      TableName: todosTable,
      Item: {
        ...result.Items[0],
        attachmentUrl: imgUrl
      }
    }).promise();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: signedUrl
      })
    }

  } else {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'ToDo not found'
      })
    }
  }

  return undefined
}
