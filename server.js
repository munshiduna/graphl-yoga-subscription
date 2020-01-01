const { GraphQLServer, PubSub } = require("graphql-yoga")

const typeDefs = `
	type Query {
		branches: [Branch!]!
	}

	type Mutation {
		createBranch(code: Int!): Branch
	}

	type Subscription {
		createdBranch: Branch!
	}

	type Branch {
		id: ID!
		code: Int!
	}
`

const branches = []

const POST_BRANCH = 'POST_BRANCH';

const resolvers = {
	Query: {
		branches: async () => branches
	},
	Mutation: {
		createBranch: async (root, { code }, { pubSub }) => {
			const branch = { id: branches.length + 2, code }
			branches.push(branch)
			pubSub.publish(POST_BRANCH, branch )
			return branch
		},
	},
	Subscription: {
		createdBranch: {
			resolve: (payload) => payload,
			subscribe: (root, args, { pubSub }) => {
				return pubSub.asyncIterator(POST_BRANCH)
			}
		},
	}
}

const pubSub = new PubSub();
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubSub } })

server.start(() => console.log('Server is running on localhost:4000'))