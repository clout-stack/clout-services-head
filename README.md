clout-services-head
===========

## Requirement
- NGinx

## Installation
Clone the repository
```bash
git clone git@github.com:clout-stack/clout-services-head.git
cd clout-services-head
```

Install dependencies
```bash
npm install
```
## Starting the service
```
node .
```

### Endpoints
- /list (list services)
- /publish (publish service)
- /unpublish (unpublish service)

### Service Model
```
{
	id: 'service id',
	user_id: 'user id',
	name: 'service name',
	archive: 'archive path',
	hosts: 'array of hosts',
	status: ['active', 'in-active', 'error'],
	server_id: 'server service is running on'
}
```

### Server Model
```
{
	id: 'server id',
	name: 'server name'
	host: 'server hostname or ip',
	port: 'server port',
	lastSeen: 'date of last seen'
}
```
