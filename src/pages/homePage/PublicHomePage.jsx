import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

function PublicHomePage() {
  return (
    <Container className="py-5">
      <header className="text-center mb-5">
        <h1 className="display-4">Smart Pocket Money Family</h1>
        <p className="lead">The best app in the world to earn money</p>
        <Button as={Link} to="/signup" variant="primary" size="lg">
          Get Started
        </Button>
      </header>

      <Row xs={1} md={3} className="g-4">
        <Col>
          <Card className="h-100 text-center shadow-sm">
            <Card.Img
              variant="top"
              src="https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/000000/external-chores-household-flaticons-lineal-color-flat-icons.png"
              alt="Create & Assign Chores"
              style={{ width: "64px", margin: "1rem auto 0" }}
            />
            <Card.Body>
              <Card.Title>Create & Assign New Chores & Allowances</Card.Title>
              <Card.Text>
                Easily add chores and assign allowances to your family members.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 text-center shadow-sm">
            <Card.Img
              variant="top"
              src="https://img.icons8.com/external-justicon-flat-justicon/64/000000/external-edit-user-interface-justicon-flat-justicon.png"
              alt="Change chore price"
              style={{ width: "64px", margin: "1rem auto 0" }}
            />
            <Card.Body>
              <Card.Title>Change Chore Prices & Notify Kids</Card.Title>
              <Card.Text>
                Adjust chore prices anytime and send WhatsApp notifications instantly.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col>
          <Card className="h-100 text-center shadow-sm">
            <Card.Img
              variant="top"
              src="https://img.icons8.com/external-flat-icons-inmotus-design/64/000000/external-whatsapp-social-media-flat-icons-inmotus-design.png"
              alt="Notify parents"
              style={{ width: "64px", margin: "1rem auto 0" }}
            />
            <Card.Body>
              <Card.Title>Notify Parents When Chores Are Done</Card.Title>
              <Card.Text>
                Kids can notify parents via WhatsApp when chores are completed.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PublicHomePage;
