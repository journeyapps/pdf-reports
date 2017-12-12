# pdf-reports

Node library to generate PDF reports from HTML.

# Installation

    yarn add @journeyapps/pdf-reports



# Development


## Setup

Clone this repo, then run:

    yarn

## Tests

To run the tests, the following environment variables are required:

    JOURNEY_PDF_KEY # Key for the PDF service
    JOURNEY_PDF_BUCKET # AWS bucket name to store test reports
    # AWS Credentials
    AWS_ACCESS_KEY_ID
    AWS_SECRET_ACCESS_KEY

Then run:

    yarn test
