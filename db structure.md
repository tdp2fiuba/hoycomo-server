## MongoDB Structure

### User

- key:
	`user_id : string`
- value:
```javascript
	{	
		“first_name” : string,
		“last_name” : string,
		"description" : string,
		"login" : string,
		“password” : string | encrypt,
		“register_timestamp” : integer,
		“last_edit_timestamp” : integer,
		“email” : string,
		“date_of_birth”: string,
		"address" : [
			{
				"name" : string,
				"latitude" : float,
				"longitude" : float
			}
		],
		“orders : [
			order_id : string
		]
	}
```

## Commerce

- key:
	`commerce_id : string`
- value:
```javascript
	{	
		“name” : string,
		"description" : string,
		"login" : string,
		“password” : string | encrypt,
		“register_timestamp” : integer,
		“last_edit_timestamp” : integer,
		“email” : string,
		“date_of_birth”: string,
		"address" : [
			{
				"name" : string,
				"latitude" : float,
				"longitude" : float
			}
		],
		“menu : [
			dish_id : string
		]
	}
```